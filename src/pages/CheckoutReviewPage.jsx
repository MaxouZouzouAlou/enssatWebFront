import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import CheckoutStepShell from '../features/checkout/CheckoutStepShell.jsx';
import CheckoutSummaryCard from '../features/checkout/CheckoutSummaryCard.jsx';
import { clearCheckoutDraft, loadCheckoutDraft } from '../features/checkout/checkoutDraft.js';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { checkoutCurrentCart, previewCheckout } from '../services/orders-client.js';

function formatAddress(address) {
	if (!address) return '';
	return [address.ligne, address.codePostal, address.ville].filter(Boolean).join(', ');
}

export default function CheckoutReviewPage() {
	const navigate = useNavigate();
	const { cartItems, updateQuantity } = useOutletContext();
	const draft = useMemo(() => loadCheckoutDraft(), []);
	const [preview, setPreview] = useState(draft.preview || null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		let ignore = false;
		if (!draft.modeLivraison || !draft.modePaiement) return () => {
			ignore = true;
		};

		previewCheckout({
			modeLivraison: draft.modeLivraison,
			modePaiement: draft.modePaiement,
			relayId: draft.relayId,
			pickupAssignments: draft.pickupAssignments
		})
			.then((data) => {
				if (!ignore) {
					setPreview(data);
					setError('');
				}
			})
			.catch((previewError) => {
				if (!ignore) setError(previewError.message || 'Impossible de charger la vérification finale.');
			});

		return () => {
			ignore = true;
		};
	}, [draft.modeLivraison, draft.modePaiement, draft.pickupAssignments, draft.relayId]);

	if (!cartItems.length) {
		return <Navigate to="/panier" replace />;
	}

	if (!draft.modeLivraison) {
		return <Navigate to="/commande/livraison" replace />;
	}

	if (!draft.modePaiement) {
		return <Navigate to="/commande/paiement" replace />;
	}

	const submitOrder = async () => {
		setSubmitting(true);
		setError('');
		try {
			const result = await checkoutCurrentCart({
				modeLivraison: draft.modeLivraison,
				modePaiement: draft.modePaiement,
				relayId: draft.relayId,
				pickupAssignments: draft.pickupAssignments
			});
			await Promise.all(
				cartItems.map((item) => updateQuantity(item.product.idProduit ?? item.product.id, 0))
			);
			clearCheckoutDraft();
			navigate(`/commandes/${result.order.idCommande}`, { replace: true });
		} catch (checkoutError) {
			setError(checkoutError.message || 'Impossible de valider la commande.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<PageShell contentClassName="max-w-6xl">
			<SectionHeader eyebrow="Commande" title="Finaliser ma commande">
				<p>Vérifiez une dernière fois les choix de livraison et de paiement avant validation.</p>
			</SectionHeader>

			<div className="mt-8">
				<CheckoutStepShell
					activeStep="verification"
					title="Étape 3 · Vérification"
					description="Le serveur recalcule le total final à partir de vos choix et du contenu réel du panier."
					aside={<CheckoutSummaryCard preview={preview} cartItems={cartItems} />}
				>
					<SurfaceCard className="space-y-5 p-5 sm:p-6">
						<div className="rounded-2xl border border-neutral-200 bg-[#fcfaf5] p-4">
							<p className="text-sm font-semibold uppercase tracking-[0.1em] text-primary-700">Livraison</p>
							<p className="mt-2 text-base font-semibold text-secondary-900">{preview?.modeLivraison || draft.modeLivraison}</p>
							{preview?.delivery?.address ? (
								<p className="mt-1 text-sm text-secondary-600">{preview.delivery.address.label || formatAddress(preview.delivery.address)}</p>
							) : null}
							{preview?.delivery?.relay ? (
								<p className="mt-1 text-sm text-secondary-600">
									{preview.delivery.relay.nom} · {formatAddress(preview.delivery.relay.adresse)}
								</p>
							) : null}
							{preview?.pickupRoute?.stops?.length ? (
								<p className="mt-1 text-sm text-secondary-600">
									{preview.pickupRoute.stops.length} arrêt(s) en point de vente.
								</p>
							) : null}
						</div>

						<div className="rounded-2xl border border-neutral-200 bg-[#fcfaf5] p-4">
							<p className="text-sm font-semibold uppercase tracking-[0.1em] text-primary-700">Paiement</p>
							<p className="mt-2 text-base font-semibold text-secondary-900">{preview?.modePaiementLabel || draft.modePaiement}</p>
						</div>

						{preview?.items?.some((item) => item.selectedLieu) ? (
							<div className="rounded-2xl border border-neutral-200 bg-white p-4">
								<p className="text-sm font-semibold text-secondary-900">Affectation des produits</p>
								<div className="mt-3 space-y-3">
									{preview.items.map((item) => (
										<div key={item.idProduit} className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 px-3 py-3">
											<div>
												<p className="font-semibold text-secondary-900">{item.nom}</p>
												<p className="text-sm text-secondary-600">Quantité : {item.quantite}</p>
											</div>
											<div className="text-right text-sm text-secondary-600">
												{item.selectedLieu ? (
													<>
														<p className="font-semibold text-secondary-900">{item.selectedLieu.nom}</p>
														<p>{formatAddress(item.selectedLieu.adresse)}</p>
													</>
												) : (
													<p>Aucun point sélectionné</p>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						) : null}

						{error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

						<div className="flex flex-wrap justify-end gap-3">
							<ActionButton type="button" variant="secondary" onClick={() => navigate('/commande/paiement')}>
								Retour au paiement
							</ActionButton>
							<ActionButton type="button" loading={submitting} onClick={submitOrder} disabled={!preview}>
								Valider la commande
							</ActionButton>
						</div>
					</SurfaceCard>
				</CheckoutStepShell>
			</div>
		</PageShell>
	);
}
