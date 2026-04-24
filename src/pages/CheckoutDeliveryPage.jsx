import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import DeliveryAddressForm from '../features/checkout/DeliveryAddressForm.jsx';
import DeliveryModeSelector from '../features/checkout/DeliveryModeSelector.jsx';
import PickupAssignmentsPanel from '../features/checkout/PickupAssignmentsPanel.jsx';
import RelaySelectorPanel from '../features/checkout/RelaySelectorPanel.jsx';
import useCheckoutDraft from '../features/checkout/useCheckoutDraft/useCheckoutDraft.js';
import useCheckoutPreview from '../features/checkout/useCheckoutPreview/useCheckoutPreview.js';
import CheckoutStepShell from '../features/checkout/CheckoutStepShell.jsx';
import CheckoutSummaryCard from '../features/checkout/CheckoutSummaryCard/CheckoutSummaryCard.jsx';
import useCheckoutContext from '../features/checkout/useCheckoutContext/useCheckoutContext.js';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';

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
	const { draft, saveDraft } = useCheckoutDraft();
	const { data: context, error: contextError, isLoading: loading } = useCheckoutContext();
	const [modeLivraison, setModeLivraison] = useState(draft.modeLivraison || 'point_relais');
	const [relayId, setRelayId] = useState(draft.relayId || '');
	const [pickupAssignments, setPickupAssignments] = useState(draft.pickupAssignments || []);
	const [adresseLivraison, setAdresseLivraison] = useState(buildAddressForm(draft.adresseLivraison));
	const selectedDeliveryFee = useMemo(
		() => Number(context?.deliveryModes?.find((option) => option.value === modeLivraison)?.frais || 0),
		[context?.deliveryModes, modeLivraison]
	);
	const pickupOptimizationReady = Boolean(context?.pickup?.originGeocoded);

	useEffect(() => {
		if (!context) return;
		if (!draft.adresseLivraison) {
			setAdresseLivraison(buildAddressForm(context?.defaultDeliveryAddress));
		}
		if (!draft.pickupAssignments?.length && Array.isArray(context?.pickup?.defaultAssignments)) {
			setPickupAssignments(context.pickup.defaultAssignments);
		}
	}, [context, draft.adresseLivraison, draft.pickupAssignments]);

	const previewPayload = useMemo(() => ({
		modeLivraison,
		modePaiement: draft.modePaiement || 'carte_bancaire',
		relayId: relayId ? Number(relayId) : undefined,
		adresseLivraison,
		pickupAssignments
	}), [adresseLivraison, draft.modePaiement, modeLivraison, pickupAssignments, relayId]);
	const { preview, error: previewError } = useCheckoutPreview({
		payload: previewPayload,
		enabled: Boolean(context) && !(modeLivraison === 'point_relais' && !relayId),
		initialPreview: null,
		errorMessage: 'Impossible de calculer le recapitulatif.'
	});
	const selectedRelay = useMemo(
		() => preview?.delivery?.relay || null,
		[preview]
	);
	const selectedPickupStops = useMemo(
		() => preview?.pickupRoute?.stops || [],
		[preview]
	);

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
		saveDraft({
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
				) : contextError ? (
					<SurfaceCard className="mt-8 p-6 text-sm font-semibold text-red-700">{contextError.message || 'Impossible de charger le checkout.'}</SurfaceCard>
			) : (
				<div className="mt-8">
						<CheckoutStepShell
							activeStep="livraison"
							title="Étape 1 · Livraison"
							description="Choisissez le mode de livraison global, puis complétez la sélection demandée."
							aside={<CheckoutSummaryCard preview={preview} cartItems={cartItems} fallbackDeliveryFees={selectedDeliveryFee} />}
						>
							<SurfaceCard className="p-5 sm:p-6">
								<DeliveryModeSelector
									options={context?.deliveryModes || []}
									modeLivraison={modeLivraison}
									onChange={setModeLivraison}
									formatAddress={formatAddress}
								/>

								{modeLivraison === 'point_relais' ? (
									<RelaySelectorPanel
										relayId={relayId}
										onChange={setRelayId}
										relayOptions={context?.relayOptions || []}
										selectedRelay={selectedRelay}
										formatAddress={formatAddress}
									/>
								) : null}

								{modeLivraison === 'domicile' ? (
									<DeliveryAddressForm
										adresseLivraison={adresseLivraison}
										onAddressLineChange={(nextValue) => setAdresseLivraison((current) => ({ ...current, adresse_ligne: nextValue }))}
										onPostalCodeChange={updateAdresseLivraison('code_postal')}
										onCityChange={updateAdresseLivraison('ville')}
										onSuggestionSelect={selectAdresseLivraison}
									/>
								) : null}

								{modeLivraison === 'lieu_vente' ? (
									<PickupAssignmentsPanel
										pickupOptimizationReady={pickupOptimizationReady}
										optimizedStopsCount={context?.pickup?.optimizedStopsCount}
										items={context?.items || []}
										pickupAssignments={pickupAssignments}
										onAssignmentChange={setAssignment}
										selectedPickupStops={selectedPickupStops}
										totalDistanceKm={preview?.pickupRoute?.totalDistanceKm}
										formatAddress={formatAddress}
									/>
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
