import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import ProductGrid from '../components/ProductGrid';
import { ActionButton } from '../components/Button.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SoftPanel from '../components/layout/SoftPanel.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import productsService from '../services/products';
import {
	fetchProductReviews,
	fetchProfessionalReviews,
	postProductReview,
	postProfessionalReview,
} from '../services/reviews-client.js';

function AchatPage() {
	const { addToCart, accountType, isAuthenticated } = useOutletContext();
	const navigate = useNavigate();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [reviewsData, setReviewsData] = useState(null);
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [reviewError, setReviewError] = useState('');
	const [reviewMessage, setReviewMessage] = useState('');
	const [productReviewForm, setProductReviewForm] = useState({ note: 5, commentaire: '' });
	const [producerReviewForm, setProducerReviewForm] = useState({ note: 5, commentaire: '' });

	const canReview = isAuthenticated && accountType === 'particulier';

	const loadReviews = async (product) => {
		setSelectedProduct(product);
		setReviewsLoading(true);
		setReviewError('');
		setReviewMessage('');

		try {
			const [productReviews, producerReviews] = await Promise.all([
				fetchProductReviews(product.idProduit),
				fetchProfessionalReviews(product.idProfessionnel),
			]);
			setReviewsData({ productReviews, producerReviews });
		} catch (err) {
			setReviewError(err.message || 'Impossible de charger les avis.');
		} finally {
			setReviewsLoading(false);
		}
	};

	const openProduct = (product) => {
		const idProduit = product.idProduit ?? product.id ?? product._id;
		if (idProduit == null) return;
		navigate(`/produits/${idProduit}`);
	};

	const submitProductReview = async (event) => {
		event.preventDefault();
		if (!selectedProduct) return;

		try {
			await postProductReview(selectedProduct.idProduit, {
				note: Number(productReviewForm.note),
				commentaire: productReviewForm.commentaire,
			});
			setReviewMessage('Avis produit enregistre.');
			await loadReviews(selectedProduct);
		} catch (err) {
			setReviewError(err.message || 'Impossible d\'enregistrer votre avis produit.');
		}
	};

	const submitProducerReview = async (event) => {
		event.preventDefault();
		if (!selectedProduct) return;

		try {
			await postProfessionalReview(selectedProduct.idProfessionnel, {
				note: Number(producerReviewForm.note),
				commentaire: producerReviewForm.commentaire,
			});
			setReviewMessage('Avis producteur enregistre.');
			await loadReviews(selectedProduct);
		} catch (err) {
			setReviewError(err.message || 'Impossible d\'enregistrer votre avis producteur.');
		}
	};

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		productsService
			.getListProducts()
			.then((data) => {
				if (!mounted) return;
				setProducts(Array.isArray(data) ? data : data?.items || []);
			})
			.catch((err) => {
				if (mounted) setError(err.message || 'Erreur lors de la récupération');
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, []);

	console.log('Achat page products:', products);

	if (loading) {
		return (
			<PageShell contentClassName="flex min-h-[50vh] items-center justify-center">
				<SurfaceCard className="text-center">
					<p className="text-sm font-semibold text-primary-700">Chargement des produits...</p>
				</SurfaceCard>
			</PageShell>
		);
	}

	if (error) {
		return (
			<PageShell contentClassName="flex min-h-[50vh] items-center justify-center">
				<SurfaceCard className="max-w-xl text-center">
					<p className="text-sm font-semibold text-red-700">Erreur : {error}</p>
				</SurfaceCard>
			</PageShell>
		);
	}

	return (
		<PageShell>
			<SectionHeader
				eyebrow="Marché local"
				title="Produits disponibles"
			>
				<p>Produits frais, de saison et proposés par les producteurs référencés.</p>
			</SectionHeader>
			<div className="mt-10 grid gap-6 xl:grid-cols-[2fr_1fr]">
				<ProductGrid products={products} addToCart={addToCart} onOpenReviews={loadReviews} onOpenProduct={openProduct} />

				<SurfaceCard className="h-fit p-4">
					<h2 className="text-lg font-semibold text-secondary-900">Avis et notes</h2>
					<p className="mt-1 text-sm text-neutral-600">Selectionnez un produit pour consulter et ajouter des avis.</p>

					{reviewsLoading ? <p className="mt-3 text-sm text-neutral-600">Chargement des avis...</p> : null}
					{reviewError ? <p className="mt-3 text-sm font-semibold text-red-700">{reviewError}</p> : null}
					{reviewMessage ? <p className="mt-3 text-sm font-semibold text-primary-700">{reviewMessage}</p> : null}

					{selectedProduct ? (
						<div className="mt-4 space-y-4">
							<SoftPanel>
								<p className="font-semibold text-secondary-900">{selectedProduct.nom}</p>
								<p className="text-sm text-neutral-600">Produit: {Number(reviewsData?.productReviews?.summary?.noteMoyenne || 0).toFixed(1)}/5 ({reviewsData?.productReviews?.summary?.nombreAvis || 0})</p>
								<p className="text-sm text-neutral-600">Producteur: {Number(reviewsData?.producerReviews?.summary?.noteMoyenne || 0).toFixed(1)}/5 ({reviewsData?.producerReviews?.summary?.nombreAvis || 0})</p>
							</SoftPanel>

							{canReview ? (
								<>
									<form onSubmit={submitProductReview} className="rounded-xl border border-neutral-200 p-3">
										<p className="text-sm font-semibold text-secondary-900">Noter ce produit</p>
										<div className="mt-2 flex items-center gap-2">
											<select
												value={productReviewForm.note}
												onChange={(event) => setProductReviewForm((prev) => ({ ...prev, note: Number(event.target.value) }))}
												className="h-9 rounded-lg border border-neutral-300 px-2"
											>
												{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}
											</select>
											<input
												value={productReviewForm.commentaire}
												onChange={(event) => setProductReviewForm((prev) => ({ ...prev, commentaire: event.target.value }))}
												placeholder="Commentaire"
												className="h-9 flex-1 rounded-lg border border-neutral-300 px-3"
											/>
										</div>
										<ActionButton type="submit" className="mt-2 h-9 text-xs">Envoyer avis produit</ActionButton>
									</form>

									<form onSubmit={submitProducerReview} className="rounded-xl border border-neutral-200 p-3">
										<p className="text-sm font-semibold text-secondary-900">Noter ce producteur</p>
										<div className="mt-2 flex items-center gap-2">
											<select
												value={producerReviewForm.note}
												onChange={(event) => setProducerReviewForm((prev) => ({ ...prev, note: Number(event.target.value) }))}
												className="h-9 rounded-lg border border-neutral-300 px-2"
											>
												{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}
											</select>
											<input
												value={producerReviewForm.commentaire}
												onChange={(event) => setProducerReviewForm((prev) => ({ ...prev, commentaire: event.target.value }))}
												placeholder="Commentaire"
												className="h-9 flex-1 rounded-lg border border-neutral-300 px-3"
											/>
										</div>
										<ActionButton type="submit" className="mt-2 h-9 text-xs">Envoyer avis producteur</ActionButton>
									</form>
								</>
							) : (
								<p className="text-sm text-neutral-600">Connectez-vous avec un compte particulier pour noter.</p>
							)}

							<div className="space-y-2">
								<p className="text-sm font-semibold text-secondary-900">Derniers avis produits</p>
								{(reviewsData?.productReviews?.reviews || []).slice(0, 3).map((review) => (
									<SoftPanel key={`p-${review.idAvisProduit}`} className="p-3">
										<p className="text-xs text-neutral-500">{review.prenom} {review.nom} • {review.note}/5</p>
										<p className="text-sm text-neutral-700">{review.commentaire || 'Sans commentaire'}</p>
									</SoftPanel>
								))}
							</div>
						</div>
					) : (
						<p className="mt-4 text-sm text-neutral-600">Aucun produit selectionne.</p>
					)}
				</SurfaceCard>
			</div>
		</PageShell>
	);
}

export default AchatPage;
