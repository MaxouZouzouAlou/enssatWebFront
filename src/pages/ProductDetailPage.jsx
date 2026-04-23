import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import productsService from '../services/products';
import { fetchProductReviews, postProductReview } from '../services/reviews-client.js';
import { formatProductStock, isUnitProduct } from '../utils/cartQuantity.js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:49161';

function formatPrice(price, isUnit) {
	const value = Number(price || 0);
	return `${value.toFixed(2)} €${isUnit ? ' / unité' : ' / kg'}`;
}

function renderStars(note) {
	const rounded = Math.max(0, Math.min(5, Math.round(Number(note) || 0)));
	return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
}

function normalizeIdentity(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.toLowerCase();
}

function resolveProductImageUrl(imageValue) {
	if (!imageValue || typeof imageValue !== 'string') return null;
	const trimmed = imageValue.trim();
	if (!trimmed) return null;
	if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
	const base = API_BASE_URL.replace(/\/$/, '');
	const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
	return `${base}${normalizedPath}`;
}

function getCompanyName(product) {
	const candidates = [
		product?.entrepriseNom,
		product?.nomEntreprise,
		product?.raisonSociale,
		product?.entreprise?.nom,
		product?.entreprise?.nomEntreprise,
		product?.professionnel?.entrepriseNom,
		product?.professionnel?.nomEntreprise,
		product?.professionnel?.nom,
		typeof product?.professionnel === 'string' ? product.professionnel : null,
		typeof product?.producteur === 'string' ? product.producteur : null,
		product?.sellerName,
	];

	const found = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
	return found?.trim() || 'Producteur local';
}

function ProductDetailPage() {
	const { addToCart, isAuthenticated, accountType, profile } = useOutletContext();
	const navigate = useNavigate();
	const { idProduit } = useParams();
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [quantity, setQuantity] = useState(1);
	const [reviewsData, setReviewsData] = useState({ summary: null, reviews: [] });
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [reviewsError, setReviewsError] = useState('');
	const [reviewMessage, setReviewMessage] = useState('');
	const [reviewForm, setReviewForm] = useState({ note: 5, commentaire: '' });
	const [isEditingReview, setIsEditingReview] = useState(false);
	const [imageError, setImageError] = useState(false);
	const canReview = isAuthenticated && accountType === 'particulier';

	const imageUrl = resolveProductImageUrl(product?.imagePath ?? product?.image ?? product?.path ?? product?.imageUrl ?? null);

	useEffect(() => {
		setImageError(false);
	}, [imageUrl]);

	useEffect(() => {
		let mounted = true;

		if (!idProduit) {
			setError('Identifiant produit manquant.');
			setLoading(false);
			return () => {
				mounted = false;
			};
		}

		setLoading(true);
		setError('');
		setProduct(null);

		productsService
			.getProductById(idProduit)
			.then((data) => {
				if (!mounted) return;
				setProduct(data);
				setQuantity(isUnitProduct(data) ? 1 : 1);
			})
			.catch((err) => {
				if (mounted) setError(err.message || 'Impossible de charger ce produit.');
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, [idProduit]);

	useEffect(() => {
		let mounted = true;

		if (!idProduit) return () => {
			mounted = false;
		};

		setReviewsLoading(true);
		setReviewsError('');

		fetchProductReviews(idProduit)
			.then((data) => {
				if (!mounted) return;
				setReviewsData({
					summary: data?.summary || null,
					reviews: Array.isArray(data?.reviews) ? data.reviews : [],
				});
			})
			.catch((err) => {
				if (!mounted) return;
				setReviewsError(err.message || 'Impossible de charger les avis.');
			})
			.finally(() => {
				if (mounted) setReviewsLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, [idProduit]);

	if (loading) {
		return (
			<PageShell contentClassName="flex min-h-[50vh] items-center justify-center">
				<SurfaceCard className="text-center">
					<p className="text-sm font-semibold text-primary-700">Chargement du produit...</p>
				</SurfaceCard>
			</PageShell>
		);
	}

	if (error) {
		return (
			<PageShell contentClassName="flex min-h-[50vh] items-center justify-center">
				<SurfaceCard className="max-w-xl text-center">
					<p className="text-sm font-semibold text-red-700">Erreur : {error}</p>
					<div className="mt-4 flex items-center justify-center gap-3">
						<ActionButton type="button" variant="secondary" onClick={() => navigate(-1)}>
							Retour
						</ActionButton>
						<Link className="text-sm font-semibold text-primary-700 hover:text-primary-800" to="/produits">
							Voir le catalogue
						</Link>
					</div>
				</SurfaceCard>
			</PageShell>
		);
	}

	if (!product) {
		return null;
	}

	const name = product.nom ?? product.name ?? product.title ?? 'Sans nom';
	const isUnit = isUnitProduct(product);
	const image = imageUrl;
	const stockLabel = formatProductStock(product, product.stock ?? null);
	const bio = product.bio === 1 || product.bio === '1' || product.bio === true;
	const producer = getCompanyName(product);
	const noteMoyenneProduit = Number(product.noteMoyenneProduit ?? 0);
	const nombreAvisProduit = Number(product.nombreAvisProduit ?? 0);
	const noteMoyenneProducteur = Number(product.noteMoyenneProducteur ?? 0);
	const nombreAvisProducteur = Number(product.nombreAvisProducteur ?? 0);
	const quantityStep = isUnit ? 1 : 0.1;

	const handleAddToCart = async () => {
		await addToCart(product, Number(quantity) || quantityStep);
	};

	const submitReview = async (event) => {
		event.preventDefault();
		setReviewsError('');
		setReviewMessage('');

		try {
			await postProductReview(idProduit, {
				note: Number(reviewForm.note),
				commentaire: reviewForm.commentaire,
			});
			const refreshed = await fetchProductReviews(idProduit);
			setReviewsData({
				summary: refreshed?.summary || null,
				reviews: Array.isArray(refreshed?.reviews) ? refreshed.reviews : [],
			});
			setIsEditingReview(false);
			setReviewForm({ note: 5, commentaire: '' });
			setReviewMessage(myReview ? 'Votre avis a été mis à jour.' : 'Votre avis a été enregistré.');
		} catch (err) {
			setReviewsError(err.message || 'Impossible d\'enregistrer votre avis.');
		}
	};

	const openEditReview = (review) => {
		setReviewForm({
			note: Number(review.note || 5),
			commentaire: review.commentaire || '',
		});
		setReviewMessage('');
		setReviewsError('');
		setIsEditingReview(true);
	};

	const displayedProductAverage = Number(reviewsData?.summary?.noteMoyenne ?? noteMoyenneProduit);
	const displayedProductCount = Number(reviewsData?.summary?.nombreAvis ?? nombreAvisProduit);
	const currentUserNom = normalizeIdentity(profile?.user?.nom);
	const currentUserPrenom = normalizeIdentity(profile?.user?.prenom);
	const myReview = (reviewsData.reviews || []).find((review) => (
		normalizeIdentity(review.nom) === currentUserNom && normalizeIdentity(review.prenom) === currentUserPrenom
	));
	const canCreateReview = canReview && !myReview;
	const canEditReview = canReview && Boolean(myReview);

	return (
		<PageShell>
			<div className="mb-4">
				<Link className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800" to="/produits">
					<span className="material-symbols-rounded text-base">arrow_back</span>
					Retour au catalogue
				</Link>
			</div>
			<SectionHeader eyebrow="Produit" title={name}>
				<p>{producer}</p>
			</SectionHeader>

			<div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
				<SurfaceCard className="overflow-hidden">
					<div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 via-neutral-100 to-secondary-100">
						{image && !imageError ? (
							<img
								src={image}
								alt={name}
								className="h-full w-full object-cover"
								onError={(event) => {
									event.currentTarget.onerror = null;
									setImageError(true);
								}}
							/>
						) : (
							<div className="flex h-full items-center justify-center text-primary-700/60">
								<span className="material-symbols-rounded text-7xl">local_florist</span>
							</div>
						)}
						<div className="absolute left-4 top-4 flex gap-2">
							<span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-secondary-700 shadow-sm">{product.nature || 'Autre'}</span>
							{bio ? <span className="rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">Bio</span> : null}
						</div>
					</div>
					<div className="space-y-4 p-5">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary-700">{producer}</p>
								<h2 className="mt-1 text-3xl font-bold text-secondary-900">{name}</h2>
							</div>
							<p className="text-2xl font-bold text-primary-700">{formatPrice(product.prix ?? product.price, isUnit)}</p>
						</div>

						<p className="text-sm text-secondary-600">{stockLabel}</p>

						<div className="grid gap-3 sm:grid-cols-3">
							<SurfaceCard className="p-3">
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Avis produit</p>
								<p className="mt-1 text-lg font-bold text-secondary-900">{displayedProductAverage.toFixed(1)}/5</p>
								<p className="text-sm text-secondary-500">{displayedProductCount} avis</p>
							</SurfaceCard>
							<SurfaceCard className="p-3">
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Avis producteur</p>
								<p className="mt-1 text-lg font-bold text-secondary-900">{noteMoyenneProducteur.toFixed(1)}/5</p>
								<p className="text-sm text-secondary-500">{nombreAvisProducteur} avis</p>
							</SurfaceCard>
							<SurfaceCard className="p-3">
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Disponibilité</p>
								<p className="mt-1 text-lg font-bold text-secondary-900">{isUnit ? 'A l’unité' : 'Au poids'}</p>
								<p className="text-sm text-secondary-500">Produit {product.visible ? 'visible' : 'masqué'}</p>
							</SurfaceCard>
						</div>
					</div>
				</SurfaceCard>

				<div className="space-y-6">
					<SurfaceCard className="p-5">
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Commande</p>
						<h3 className="mt-2 text-xl font-bold text-secondary-900">Ajouter au panier</h3>
						<div className="mt-4 flex flex-col gap-3">
							<label className="text-sm font-medium text-secondary-700">
								Quantité
								<input
									type="number"
									min={quantityStep}
									step={quantityStep}
									value={quantity}
									onChange={(event) => setQuantity(event.target.value)}
									className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-secondary-900 outline-none focus:border-primary-400"
								/>
							</label>
							<ActionButton type="button" className="w-full" onClick={handleAddToCart}>
								Ajouter au panier
							</ActionButton>
							<ActionButton type="button" variant="secondary" className="w-full" onClick={() => navigate('/panier')}>
								Voir mon panier
							</ActionButton>
						</div>
					</SurfaceCard>

					<SurfaceCard className="p-5">
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Avis clients</p>
						<h3 className="mt-2 text-xl font-bold text-secondary-900">Commentaires sur ce produit</h3>
						<p className="mt-2 text-sm text-secondary-600">
							{displayedProductAverage.toFixed(1)}/5 · {displayedProductCount} avis
						</p>

						{reviewsLoading ? <p className="mt-4 text-sm text-secondary-600">Chargement des avis...</p> : null}
						{reviewsError ? <p className="mt-4 text-sm font-semibold text-red-700">{reviewsError}</p> : null}
						{reviewMessage ? <p className="mt-4 text-sm font-semibold text-primary-700">{reviewMessage}</p> : null}

						{(canCreateReview || (canEditReview && isEditingReview)) ? (
							<form onSubmit={submitReview} className="mt-4 space-y-3 rounded-xl border border-neutral-200 p-3">
								<p className="text-sm font-semibold text-secondary-900">
									{canEditReview ? 'Modifier votre note et votre commentaire' : 'Laisser une note et un commentaire'}
								</p>
								<div className="flex items-center gap-1" role="radiogroup" aria-label="Note du produit">
									{[1, 2, 3, 4, 5].map((n) => {
										const active = n <= Number(reviewForm.note || 0);
										return (
											<button
												key={n}
												type="button"
												role="radio"
												aria-checked={Number(reviewForm.note) === n}
												aria-label={`${n} sur 5`}
												onClick={() => setReviewForm((prev) => ({ ...prev, note: n }))}
												onKeyDown={(event) => {
													if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
														event.preventDefault();
														setReviewForm((prev) => ({ ...prev, note: Math.min(5, Number(prev.note || 0) + 1) }));
													}
													if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
														event.preventDefault();
														setReviewForm((prev) => ({ ...prev, note: Math.max(1, Number(prev.note || 0) - 1) }));
													}
												}}
												className={`text-2xl leading-none transition ${active ? 'text-amber-500' : 'text-neutral-300 hover:text-amber-400'} focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-sm`}
											>
												★
											</button>
										);
									})}
									<span className="ml-2 text-sm font-semibold text-secondary-700">{Number(reviewForm.note || 0)}/5</span>
								</div>
								<textarea
									value={reviewForm.commentaire}
									onChange={(event) => setReviewForm((prev) => ({ ...prev, commentaire: event.target.value }))}
									placeholder="Votre commentaire"
									rows={3}
									className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
								/>
								<div className="flex items-center gap-2">
									<ActionButton type="submit" className="h-9 text-xs">
										{canEditReview ? 'Enregistrer les modifications' : 'Publier mon avis'}
									</ActionButton>
									{canEditReview ? (
										<ActionButton
											type="button"
											variant="secondary"
											className="h-9 text-xs"
											onClick={() => {
												setIsEditingReview(false);
												setReviewForm({ note: 5, commentaire: '' });
											}}
										>
											Annuler
										</ActionButton>
									) : null}
								</div>
							</form>
						) : canEditReview ? (
							<p className="mt-4 text-sm text-secondary-600">
								Vous avez déjà laissé un avis. Utilisez l'icône d'édition sur votre commentaire pour le modifier.
							</p>
						) : (
							<p className="mt-4 text-sm text-secondary-600">Connectez-vous avec un compte particulier pour laisser un avis.</p>
						)}

						<div className="mt-4 space-y-3">
							{(reviewsData.reviews || []).length ? (
								reviewsData.reviews.map((review) => {
									const isMyReview =
										normalizeIdentity(review.nom) === currentUserNom && normalizeIdentity(review.prenom) === currentUserPrenom;
									return (
										<div key={review.idAvisProduit} className="rounded-xl border border-neutral-200 p-3">
											<div className="flex items-center justify-between gap-2">
												<p className="text-xs font-semibold text-neutral-500">
													{review.prenom} {review.nom} · {Number(review.note || 0)}/5
												</p>
												{isMyReview ? (
													<button
														type="button"
														onClick={() => openEditReview(review)}
														className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-secondary-600 transition hover:bg-neutral-100 hover:text-primary-700"
														aria-label="Modifier mon commentaire"
														title="Modifier mon commentaire"
													>
														<span className="material-symbols-rounded text-base">edit</span>
													</button>
												) : null}
											</div>
											<p className="mt-1 text-sm font-semibold text-amber-500">{renderStars(review.note)}</p>
											<p className="mt-1 text-sm text-secondary-700">{review.commentaire || 'Sans commentaire.'}</p>
										</div>
									);
								})
							) : (
								!reviewsLoading && <p className="text-sm text-secondary-600">Aucun commentaire pour ce produit.</p>
							)}
						</div>
					</SurfaceCard>
				</div>
			</div>
		</PageShell>
	);
}

export default ProductDetailPage;
