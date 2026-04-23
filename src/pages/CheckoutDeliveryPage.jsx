import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import CheckoutStepShell from '../features/checkout/CheckoutStepShell.jsx';
import CheckoutSummaryCard from '../features/checkout/CheckoutSummaryCard.jsx';
import { loadCheckoutDraft, saveCheckoutDraft } from '../features/checkout/checkoutDraft.js';
import PickupRoutePlanner from '../features/pickup-route/PickupRoutePlanner.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { fetchCheckoutContext, previewCheckout } from '../services/orders-client.js';

function formatAddress(address) {
	if (!address) return '';
	return [address.adresse_ligne || address.ligne, address.code_postal || address.codePostal, address.ville].filter(Boolean).join(', ');
}

export default function CheckoutDeliveryPage() {
	const navigate = useNavigate();
	const { cartItems } = useOutletContext();
	const initialDraft = useMemo(() => loadCheckoutDraft(), []);
	const [context, setContext] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [preview, setPreview] = useState(null);
	const [previewError, setPreviewError] = useState('');
	const [modeLivraison, setModeLivraison] = useState(initialDraft.modeLivraison || 'point_relais');
	const [relayId, setRelayId] = useState(initialDraft.relayId || '');
	const [pickupAssignments, setPickupAssignments] = useState(initialDraft.pickupAssignments || []);

	useEffect(() => {
		let ignore = false;

		fetchCheckoutContext()
			.then((data) => {
				if (ignore) return;
				setContext(data);
				if (!initialDraft.pickupAssignments?.length && Array.isArray(data?.pickup?.defaultAssignments)) {
					setPickupAssignments(data.pickup.defaultAssignments);
				}
			})
			.catch((fetchError) => {
				if (!ignore) setError(fetchError.message || 'Impossible de charger le checkout.');
			})
			.finally(() => {
				if (!ignore) setLoading(false);
			});

		return () => {
			ignore = true;
		};
	}, [initialDraft.pickupAssignments]);

	const previewPayload = useMemo(() => ({
		modeLivraison,
		modePaiement: initialDraft.modePaiement || 'carte_bancaire',
		relayId: relayId ? Number(relayId) : undefined,
		pickupAssignments
	}), [initialDraft.modePaiement, modeLivraison, pickupAssignments, relayId]);

	useEffect(() => {
		let ignore = false;
		if (!context) return () => {
			ignore = true;
		};

		previewCheckout(previewPayload)
			.then((data) => {
				if (ignore) return;
				setPreview(data);
				setPreviewError('');
			})
			.catch((previewFetchError) => {
				if (ignore) return;
				setPreview(null);
				setPreviewError(previewFetchError.message || 'Impossible de calculer le recapitulatif.');
			});

		return () => {
			ignore = true;
		};
	}, [context, previewPayload]);

	if (!cartItems.length) {
		return <Navigate to="/panier" replace />;
	}

	const setAssignment = (idProduit, idLieu) => {
		setPickupAssignments((current) => {
			const filtered = current.filter((assignment) => Number(assignment.idProduit) !== Number(idProduit));
			return [...filtered, { idProduit: Number(idProduit), idLieu: Number(idLieu) }];
		});
	};

	const goNext = () => {
		saveCheckoutDraft({
			modeLivraison,
			relayId: relayId ? Number(relayId) : null,
			pickupAssignments,
			preview
		});
		navigate('/commande/paiement');
	};

	return (
		<PageShell contentClassName="max-w-6xl">
			<SectionHeader eyebrow="Commande" title="Finaliser ma commande">
				<p>Choisissez votre mode de livraison global puis renseignez les détails associés.</p>
			</SectionHeader>

			{loading ? (
				<SurfaceCard className="mt-8 p-6 text-sm text-secondary-600">Chargement du tunnel de commande...</SurfaceCard>
			) : error ? (
				<SurfaceCard className="mt-8 p-6 text-sm font-semibold text-red-700">{error}</SurfaceCard>
			) : (
				<div className="mt-8">
					<CheckoutStepShell
						activeStep="livraison"
						title="Étape 1 · Livraison"
						description="Choisissez le mode de livraison global, puis complétez la sélection demandée."
						aside={<CheckoutSummaryCard preview={preview} cartItems={cartItems} />}
					>
						<SurfaceCard className="p-5 sm:p-6">
							<div className="grid gap-3">
								{context?.deliveryModes?.map((option) => (
									<label
										key={option.value}
										className={`rounded-2xl border px-4 py-4 transition ${
											modeLivraison === option.value ? 'border-primary-300 bg-[#fcfaf5]' : 'border-neutral-200 bg-white'
										}`}
									>
										<div className="flex items-start gap-3">
											<input
												type="radio"
												name="modeLivraison"
												value={option.value}
												checked={modeLivraison === option.value}
												onChange={(event) => setModeLivraison(event.target.value)}
												disabled={!option.available}
												className="mt-1 accent-primary-700"
											/>
											<div>
												<p className="font-semibold text-secondary-900">{option.label}</p>
												<p className="mt-1 text-sm text-secondary-600">
													{Number(option.frais || 0).toFixed(2)} € de frais
												</p>
												{option.value === 'domicile' && option.address ? (
													<p className="mt-1 text-xs text-secondary-500">Adresse actuelle : {formatAddress(option.address)}</p>
												) : null}
												{!option.available ? (
													<p className="mt-1 text-xs font-semibold text-red-700">
														Option indisponible pour le moment.
													</p>
												) : null}
											</div>
										</div>
									</label>
								))}
							</div>

							{modeLivraison === 'point_relais' ? (
								<div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
									<label className="block text-sm font-semibold text-secondary-900" htmlFor="relay-id">
										Point relais
										<select
											id="relay-id"
											value={relayId}
											onChange={(event) => setRelayId(event.target.value)}
											className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
										>
											<option value="">Choisir un point relais</option>
											{(context?.relayOptions || []).map((relay) => (
												<option key={relay.idRelais} value={relay.idRelais}>
													{relay.nom} · {relay.adresse.ligne}, {relay.adresse.codePostal} {relay.adresse.ville}
												</option>
											))}
										</select>
									</label>
								</div>
							) : null}

							{modeLivraison === 'lieu_vente' ? (
								<div className="mt-6 space-y-4">
									<SurfaceCard className="border border-neutral-200 bg-neutral-50 p-4 shadow-none">
										<p className="text-sm font-semibold text-secondary-900">Choix par produit</p>
										<div className="mt-4 space-y-4">
											{(context?.items || []).map((item) => {
												const currentLieuId = pickupAssignments.find((assignment) => Number(assignment.idProduit) === Number(item.idProduit))?.idLieu || '';
												return (
													<div key={item.idProduit} className="rounded-2xl border border-neutral-200 bg-white p-4">
														<p className="font-semibold text-secondary-900">{item.nom}</p>
														<p className="mt-1 text-sm text-secondary-600">Quantité : {item.quantite}</p>
														<select
															value={currentLieuId}
															onChange={(event) => setAssignment(item.idProduit, event.target.value)}
															className="mt-3 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
														>
															<option value="">Choisir un point de vente</option>
															{item.availablePickupPoints.map((point) => (
																<option key={point.idLieu} value={point.idLieu}>
																	{point.nom} · {point.adresse.ligne}, {point.adresse.codePostal} {point.adresse.ville}
																</option>
															))}
														</select>
													</div>
												);
											})}
										</div>
									</SurfaceCard>

									<PickupRoutePlanner
										loading={false}
										error=""
										salesPoints={context?.pickup?.uniqueSalesPoints || []}
										recommendedLieuIds={(context?.pickup?.defaultAssignments || []).map((assignment) => Number(assignment.idLieu))}
										selectedLieuIds={[...new Set(pickupAssignments.map((assignment) => Number(assignment.idLieu)).filter(Boolean))]}
										routePreview={preview ? { route: preview.pickupRoute, uncoveredProducts: [] } : null}
										routeError={previewError}
									/>
								</div>
							) : null}

							{previewError ? <p className="mt-6 text-sm font-semibold text-red-700">{previewError}</p> : null}

							<div className="mt-6 flex flex-wrap justify-end gap-3">
								<ActionButton type="button" variant="secondary" onClick={() => navigate('/panier')}>
									Retour au panier
								</ActionButton>
								<ActionButton type="button" onClick={goNext} disabled={!preview || Boolean(previewError)}>
									Continuer vers le paiement
								</ActionButton>
							</div>
						</SurfaceCard>
					</CheckoutStepShell>
				</div>
			)}
		</PageShell>
	);
}
