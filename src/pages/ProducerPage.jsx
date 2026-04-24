import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SoftPanel from '../components/layout/SoftPanel.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { fetchProfessionalReviews, postProfessionalReview } from '../services/reviews-client.js';
import { queryKeys } from '../utils/queryKeys.js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:49161';

function resolveImageUrl(imageValue) {
	if (!imageValue || typeof imageValue !== 'string') return null;
	const trimmed = imageValue.trim();
	if (!trimmed) return null;
	if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
	const base = API_BASE_URL.replace(/\/$/, '');
	let normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
	if (normalizedPath.startsWith('/src/images/')) {
		normalizedPath = normalizedPath.replace('/src/images/', '/images/');
	}
	return `${base}${normalizedPath}`;
}

function renderStarRow(note) {
	const rounded = Math.max(0, Math.min(5, Math.round(Number(note) || 0)));
	return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
}

export default function ProducerPage({ isAuthenticated = false, accountType = 'particulier' }) {
	const { idProfessionnel } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [reviewError, setReviewError] = useState('');
	const [reviewMessage, setReviewMessage] = useState('');
	const [reviewForm, setReviewForm] = useState({ note: 5, commentaire: '' });
	const [imageError, setImageError] = useState(false);
	const canReview = isAuthenticated && accountType === 'particulier';

	const {
		data,
		error,
		isLoading,
	} = useQuery({
		queryKey: queryKeys.reviews.professional(idProfessionnel),
		queryFn: () => fetchProfessionalReviews(idProfessionnel),
		enabled: Boolean(idProfessionnel),
	});

	useEffect(() => {
		setImageError(false);
	}, [data]);

	const reviewMutation = useMutation({
		mutationFn: (payload) => postProfessionalReview(idProfessionnel, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.reviews.professional(idProfessionnel) });
		},
	});

	const profile = data?.profile || null;
	const summary = data?.summary || null;
	const reviews = useMemo(() => (Array.isArray(data?.reviews) ? data.reviews : []), [data]);
	const companies = useMemo(() => (Array.isArray(data?.companies) ? data.companies : []), [data]);
	const photoUrl = resolveImageUrl(profile?.photo);

	const submitReview = async (event) => {
		event.preventDefault();
		if (!idProfessionnel) return;

		setReviewError('');
		setReviewMessage('');

		try {
			await reviewMutation.mutateAsync({
				note: Number(reviewForm.note),
				commentaire: reviewForm.commentaire,
			});
			setReviewForm({ note: 5, commentaire: '' });
			setReviewMessage('Votre avis a été enregistré.');
		} catch (submitError) {
			setReviewError(submitError.message || 'Impossible d\'enregistrer votre avis.');
		}
	};

	const goBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
			return;
		}
		navigate('/produits');
	};

	if (!idProfessionnel) {
		return (
			<PageShell contentClassName="flex min-h-[50vh] items-center justify-center">
				<SurfaceCard className="max-w-xl text-center">
					<p className="text-sm font-semibold text-red-700">Erreur : Identifiant producteur manquant.</p>
				</SurfaceCard>
			</PageShell>
		);
	}

	if (isLoading) {
		return (
			<PageShell contentClassName="flex min-h-[50vh] items-center justify-center">
				<SurfaceCard className="text-center">
					<p className="text-sm font-semibold text-primary-700">Chargement de la fiche producteur...</p>
				</SurfaceCard>
			</PageShell>
		);
	}

	if (error) {
		return (
			<PageShell contentClassName="flex min-h-[50vh] items-center justify-center">
				<SurfaceCard className="max-w-xl text-center">
					<p className="text-sm font-semibold text-red-700">Erreur : {error.message || 'Impossible de charger la fiche producteur.'}</p>
					<div className="mt-4 flex items-center justify-center gap-3">
						<Link className="text-sm font-semibold text-primary-700 hover:text-primary-800" to="/produits">
							Voir le catalogue
						</Link>
					</div>
				</SurfaceCard>
			</PageShell>
		);
	}

	if (!profile) return null;

	return (
			<PageShell contentClassName="max-w-6xl">
				<div className="mb-4">
					<button
						type="button"
						onClick={goBack}
						className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
					>
						<span className="material-symbols-rounded text-base">arrow_back</span>
						Retour
					</button>
				</div>

			<div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
				{/* Hero image card */}
				<SurfaceCard className="overflow-hidden">
					<div className="relative min-h-[420px] bg-secondary-900">
						{photoUrl && !imageError ? (
							<img
								alt={`${profile.prenom} ${profile.nom}`}
								src={photoUrl}
								className="absolute inset-0 h-full w-full object-cover object-top opacity-95"
								onError={() => setImageError(true)}
							/>
						) : (
							<div className="absolute inset-0 flex items-center justify-center">
								<span className="material-symbols-rounded text-[96px] text-white/15">person</span>
							</div>
						)}
						<div className="absolute inset-0 bg-gradient-to-t from-secondary-950/90 via-secondary-950/45 to-transparent" />
						<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
							<p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-200">Fiche producteur</p>
							<h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">{profile.prenom} {profile.nom}</h1>
							<p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
								{profile.description || "Producteur local référencé sur Local'zh."}
							</p>
						</div>
					</div>
				</SurfaceCard>

				{/* Right column */}
				<div className="space-y-6">
					{/* Rating + contact */}
					<SurfaceCard className="p-6">
						<SectionHeader eyebrow="Note publique" title={`${Number(summary?.noteMoyenne ?? profile.noteMoyenne ?? 0).toFixed(1)}/5`}>
							<p>{Number(summary?.nombreAvis ?? profile.nombreAvis ?? 0)} avis déposés par les clients particuliers.</p>
						</SectionHeader>

						<div className="mt-6 grid gap-3 sm:grid-cols-2">
							<SoftPanel className="p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Nom</p>
								<p className="mt-1 text-base font-semibold text-secondary-900">{profile.prenom} {profile.nom}</p>
							</SoftPanel>
							<SoftPanel className="min-w-0 p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Contact</p>
								<p
									className="mt-1 break-all text-sm font-semibold text-secondary-900"
									title={profile.email || ''}
								>
									{profile.email || 'Non renseigné'}
								</p>
							</SoftPanel>
						</div>
					</SurfaceCard>

					{/* Companies */}
					{companies.length > 0 && (
						<SurfaceCard className="p-6">
							<h2 className="text-xl font-bold text-secondary-900">
								Entreprise{companies.length > 1 ? 's' : ''}
							</h2>
							<div className="mt-4 space-y-3">
								{companies.map((company) => {
									const addressParts = [company.adresse_ligne, company.code_postal, company.ville].filter(Boolean);
									return (
										<SoftPanel key={company.idEntreprise} className="p-4">
											<div className="flex items-start gap-3">
												<span className="material-symbols-rounded mt-0.5 shrink-0 text-xl text-primary-600">storefront</span>
												<div className="min-w-0">
													<p className="font-semibold text-secondary-900">{company.nom}</p>
													{addressParts.length > 0 && (
														<p className="mt-0.5 text-sm text-secondary-500">{addressParts.join(', ')}</p>
													)}
												</div>
											</div>
										</SoftPanel>
									);
								})}
							</div>
						</SurfaceCard>
					)}

					{/* Review form */}
					<SurfaceCard className="p-6">
						<h2 className="text-xl font-bold text-secondary-900">Noter ce producteur</h2>
						{canReview ? (
							<form onSubmit={submitReview} className="mt-4 space-y-3">
								<div className="flex items-center gap-1" role="radiogroup" aria-label="Note du producteur">
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
												className={`text-2xl leading-none transition ${active ? 'text-amber-500' : 'text-neutral-300 hover:text-amber-400'} rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400`}
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
									placeholder="Partagez votre expérience sur ce producteur"
									rows={4}
									className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-secondary-900 outline-none focus:border-primary-400"
								/>
								{reviewError ? <p className="text-sm font-semibold text-red-700">{reviewError}</p> : null}
								{reviewMessage ? <p className="text-sm font-semibold text-primary-700">{reviewMessage}</p> : null}
								<ActionButton type="submit" className="h-10">Envoyer l'avis</ActionButton>
							</form>
						) : (
							<p className="mt-3 text-sm text-neutral-600">Connectez-vous avec un compte particulier pour noter ce producteur.</p>
						)}
					</SurfaceCard>
				</div>
			</div>

			{/* Reviews list */}
			<SurfaceCard className="mt-6 p-6">
				<h2 className="text-xl font-bold text-secondary-900">Derniers avis</h2>
				<div className="mt-4 grid max-h-96 gap-3 overflow-y-auto pr-1">
					{reviews.length ? reviews.map((review) => (
						<SoftPanel key={review.idAvisProfessionnel} className="p-4">
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
								{review.prenom} {review.nom}
							</p>
							<p className="mt-2 text-sm font-semibold text-amber-500">{renderStarRow(review.note)}</p>
							<p className="mt-2 text-sm leading-7 text-secondary-700">{review.commentaire || 'Sans commentaire'}</p>
						</SoftPanel>
					)) : (
						<p className="text-sm text-neutral-600">Aucun avis pour le moment.</p>
					)}
				</div>
			</SurfaceCard>
		</PageShell>
	);
}
