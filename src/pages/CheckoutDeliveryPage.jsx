import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import AddressAutocompleteInput from '../features/address/AddressAutocompleteInput.jsx';
import CheckoutStepShell from '../features/checkout/CheckoutStepShell.jsx';
import CheckoutSummaryCard from '../features/checkout/CheckoutSummaryCard.jsx';
import RelaySelectionMap from '../features/checkout/RelaySelectionMap.jsx';
import { loadCheckoutDraft, saveCheckoutDraft } from '../features/checkout/checkoutDraft.js';
import PickupRouteMap from '../features/pickup-route/PickupRouteMap.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { fetchCheckoutContext, getCachedCheckoutContext, previewCheckout } from '../services/orders-client.js';

function formatAddress(address) {
	if (!address) return '';
	return [address.adresse_ligne || address.ligne, address.code_postal || address.codePostal, address.ville].filter(Boolean).join(', ');
}

function buildAddressForm(address) {
	return {
		adresse_ligne: String(address?.adresse_ligne || address?.ligne || '').trim(),
		code_postal: String(address?.code_postal || address?.codePostal || '').trim(),
		ville: String(address?.ville || '').trim()
	};
}

export default function CheckoutDeliveryPage() {
	const navigate = useNavigate();
	const { cartItems } = useOutletContext();
	const initialDraft = useMemo(() => loadCheckoutDraft(), []);
	const [context, setContext] = useState(() => getCachedCheckoutContext());
	const [loading, setLoading] = useState(() => !getCachedCheckoutContext());
	const [error, setError] = useState('');
	const [preview, setPreview] = useState(null);
	const [previewError, setPreviewError] = useState('');
	const [modeLivraison, setModeLivraison] = useState(initialDraft.modeLivraison || 'point_relais');
	const [relayId, setRelayId] = useState(initialDraft.relayId || '');
	const [pickupAssignments, setPickupAssignments] = useState(initialDraft.pickupAssignments || []);
	const [adresseLivraison, setAdresseLivraison] = useState(buildAddressForm(initialDraft.adresseLivraison));
	const selectedRelay = useMemo(
		() => preview?.delivery?.relay || null,
		[preview]
	);
	const selectedPickupStops = useMemo(
		() => preview?.pickupRoute?.stops || [],
		[preview]
	);
	const selectedDeliveryFee = useMemo(
		() => Number(context?.deliveryModes?.find((option) => option.value === modeLivraison)?.frais || 0),
		[context?.deliveryModes, modeLivraison]
	);
	const pickupOptimizationReady = Boolean(context?.pickup?.originGeocoded);

	useEffect(() => {
		let ignore = false;

		fetchCheckoutContext()
			.then((data) => {
				if (ignore) return;
				setContext(data);
				if (!initialDraft.adresseLivraison) {
					setAdresseLivraison(buildAddressForm(data?.defaultDeliveryAddress));
				}
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
	}, [initialDraft.adresseLivraison, initialDraft.pickupAssignments]);

	const previewPayload = useMemo(() => ({
		modeLivraison,
		modePaiement: initialDraft.modePaiement || 'carte_bancaire',
		relayId: relayId ? Number(relayId) : undefined,
		adresseLivraison,
		pickupAssignments
	}), [adresseLivraison, initialDraft.modePaiement, modeLivraison, pickupAssignments, relayId]);

	useEffect(() => {
		let ignore = false;
		if (!context) return () => {
			ignore = true;
		};
		if (modeLivraison === 'point_relais' && !relayId) {
			setPreview(null);
			setPreviewError('');
			return () => {
				ignore = true;
			};
		}

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
	}, [context, modeLivraison, previewPayload, relayId]);

	if (!cartItems.length) {
		return <Navigate to="/panier" replace />;
	}

	const setAssignment = (idProduit, idLieu) => {
		setPickupAssignments((current) => {
			const filtered = current.filter((assignment) => Number(assignment.idProduit) !== Number(idProduit));
			return [...filtered, { idProduit: Number(idProduit), idLieu: Number(idLieu) }];
		});
	};

	const updateAdresseLivraison = (field) => (event) => {
		setAdresseLivraison((current) => ({
			...current,
			[field]: event.target.value
		}));
	};

	const selectAdresseLivraison = (suggestion) => {
		setAdresseLivraison({
			adresse_ligne: suggestion.adresse_ligne,
			code_postal: suggestion.code_postal,
			ville: suggestion.ville
		});
	};

	const goNext = () => {
		saveCheckoutDraft({
			modeLivraison,
			relayId: relayId ? Number(relayId) : null,
			adresseLivraison,
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
						aside={<CheckoutSummaryCard preview={preview} cartItems={cartItems} fallbackDeliveryFees={selectedDeliveryFee} />}
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
													<p className="mt-1 text-xs text-secondary-500">Adresse préremplie : {formatAddress(option.address)}</p>
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
									{!relayId ? (
										<p className="mt-3 text-sm text-secondary-600">
											Sélectionnez un point relais pour afficher son emplacement et calculer le récapitulatif.
										</p>
									) : null}
									{selectedRelay ? (
										<div className="mt-4 space-y-4">
											<div className="rounded-2xl border border-neutral-200 bg-white p-4">
												<p className="font-semibold text-secondary-900">{selectedRelay.nom}</p>
												<p className="mt-1 text-sm text-secondary-600">{formatAddress(selectedRelay.adresse)}</p>
											</div>
											<RelaySelectionMap relay={selectedRelay} />
										</div>
									) : null}
								</div>
							) : null}

							{modeLivraison === 'domicile' ? (
								<div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
									<p className="text-sm font-semibold text-secondary-900">Adresse de livraison</p>
									<div className="mt-4 grid gap-4">
										<label className="block text-sm font-semibold text-secondary-900" htmlFor="delivery-address-line">
											Adresse
											<AddressAutocompleteInput
												id="delivery-address-line"
												value={adresseLivraison.adresse_ligne}
												onAddressChange={(nextValue) => setAdresseLivraison((current) => ({ ...current, adresse_ligne: nextValue }))}
												onSuggestionSelect={selectAdresseLivraison}
												className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm font-normal"
												placeholder="12 rue des Tests"
											/>
										</label>
										<div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
											<label className="block text-sm font-semibold text-secondary-900" htmlFor="delivery-postal-code">
												Code postal
												<input
													id="delivery-postal-code"
													type="text"
													value={adresseLivraison.code_postal}
													onChange={updateAdresseLivraison('code_postal')}
													className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm font-normal"
													placeholder="22300"
												/>
											</label>
											<label className="block text-sm font-semibold text-secondary-900" htmlFor="delivery-city">
												Ville
												<input
													id="delivery-city"
													type="text"
													value={adresseLivraison.ville}
													onChange={updateAdresseLivraison('ville')}
													className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm font-normal"
													placeholder="Lannion"
												/>
											</label>
										</div>
									</div>
								</div>
							) : null}

							{modeLivraison === 'lieu_vente' ? (
								<div className="mt-6 space-y-4">
									<SurfaceCard className="border border-neutral-200 bg-neutral-50 p-4 shadow-none">
										<p className="text-sm font-semibold text-secondary-900">Retrait optimisé par produit</p>
										<p className="mt-1 text-sm text-secondary-600">
											{pickupOptimizationReady
												? 'Une proposition automatique est préremplie pour limiter vos déplacements depuis votre adresse personnelle. Vous pouvez ensuite changer le point de retrait de chaque produit.'
												: 'Le calcul du trajet optimisé nécessite une adresse personnelle géocodable. Corrigez votre adresse de départ si le trajet ne peut pas être calculé.'}
										</p>
										{pickupOptimizationReady && context?.pickup?.optimizedStopsCount ? (
											<p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary-700">
												Proposition actuelle : {context.pickup.optimizedStopsCount} point(s) de retrait
											</p>
										) : null}
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

										<SurfaceCard className="border border-neutral-200 bg-[#fcfaf5] p-4 shadow-none">
											<p className="text-sm font-semibold text-secondary-900">Trajet conseillé</p>
											{selectedPickupStops.length ? (
												<>
													<p className="mt-1 text-sm text-secondary-600">
														Départ depuis votre adresse personnelle • {selectedPickupStops.length} arrêt(s) • {Number(preview?.pickupRoute?.totalDistanceKm || 0).toFixed(2)} km estimés
													</p>
													<div className="mt-3 space-y-2">
														{selectedPickupStops.map((stop) => (
															<div key={`${stop.idLieu}-${stop.stopNumber}`} className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-3 py-3">
																<div>
																	<p className="font-semibold text-secondary-900">{stop.stopNumber}. {stop.nom}</p>
																	<p className="text-sm text-secondary-600">{formatAddress(stop.adresse)}</p>
																</div>
																<p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary-500">
																	{Number(stop.legDistanceKm || 0).toFixed(2)} km
																</p>
															</div>
														))}
													</div>
													<PickupRouteMap stops={selectedPickupStops} className="mt-4" />
												</>
											) : (
												<p className="mt-2 text-sm text-secondary-600">
													Sélectionnez un point de retrait pour chaque produit afin d’afficher le trajet optimisé.
												</p>
											)}
										</SurfaceCard>
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
