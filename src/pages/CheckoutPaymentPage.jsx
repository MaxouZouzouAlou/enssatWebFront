import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import CheckoutStepShell from '../features/checkout/CheckoutStepShell.jsx';
import CheckoutSummaryCard from '../features/checkout/CheckoutSummaryCard.jsx';
import { loadCheckoutDraft, saveCheckoutDraft } from '../features/checkout/checkoutDraft.js';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { fetchCheckoutContext, previewCheckout } from '../services/orders-client.js';

export default function CheckoutPaymentPage() {
	const navigate = useNavigate();
	const { cartItems } = useOutletContext();
	const draft = useMemo(() => loadCheckoutDraft(), []);
	const [context, setContext] = useState(null);
	const [preview, setPreview] = useState(draft.preview || null);
	const [paymentMode, setPaymentMode] = useState(draft.modePaiement || 'carte_bancaire');
	const [error, setError] = useState('');

	useEffect(() => {
		let ignore = false;

		fetchCheckoutContext()
			.then((data) => {
				if (!ignore) setContext(data);
			})
			.catch((fetchError) => {
				if (!ignore) setError(fetchError.message || 'Impossible de charger le paiement.');
			});

		return () => {
			ignore = true;
		};
	}, []);

	useEffect(() => {
		let ignore = false;
		if (!draft.modeLivraison) return () => {
			ignore = true;
		};

		previewCheckout({
			modeLivraison: draft.modeLivraison,
			modePaiement: paymentMode,
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
				if (!ignore) setError(previewError.message || 'Impossible de recalculer le paiement.');
			});

		return () => {
			ignore = true;
		};
	}, [draft.modeLivraison, draft.pickupAssignments, draft.relayId, paymentMode]);

	if (!cartItems.length) {
		return <Navigate to="/panier" replace />;
	}

	if (!draft.modeLivraison) {
		return <Navigate to="/commande/livraison" replace />;
	}

	const goNext = () => {
		saveCheckoutDraft({
			...draft,
			modePaiement: paymentMode,
			preview
		});
		navigate('/commande/verification');
	};

	return (
		<PageShell contentClassName="max-w-6xl">
			<SectionHeader eyebrow="Commande" title="Finaliser ma commande">
				<p>Sélectionnez votre mode de paiement avant la validation finale.</p>
			</SectionHeader>

			<div className="mt-8">
				<CheckoutStepShell
					activeStep="paiement"
					title="Étape 2 · Paiement"
					description="Choisissez votre mode de paiement et vérifiez l’impact sur le récapitulatif."
					aside={<CheckoutSummaryCard preview={preview} cartItems={cartItems} />}
				>
					<SurfaceCard className="p-5 sm:p-6">
						<div className="grid gap-3">
							{(context?.paymentModes || []).map((mode) => (
								<label
									key={mode.value}
									className={`rounded-2xl border px-4 py-4 transition ${
										paymentMode === mode.value ? 'border-primary-300 bg-[#fcfaf5]' : 'border-neutral-200 bg-white'
									}`}
								>
									<div className="flex items-start gap-3">
										<input
											type="radio"
											name="modePaiement"
											value={mode.value}
											checked={paymentMode === mode.value}
											onChange={(event) => setPaymentMode(event.target.value)}
											className="mt-1 accent-primary-700"
										/>
										<div>
											<p className="font-semibold text-secondary-900">{mode.label}</p>
											<p className="mt-1 text-sm text-secondary-600">
												Ce mode de paiement sera enregistré avec la commande.
											</p>
										</div>
									</div>
								</label>
							))}
						</div>

						{error ? <p className="mt-5 text-sm font-semibold text-red-700">{error}</p> : null}

						<div className="mt-6 flex flex-wrap justify-end gap-3">
							<ActionButton type="button" variant="secondary" onClick={() => navigate('/commande/livraison')}>
								Retour à la livraison
							</ActionButton>
							<ActionButton type="button" onClick={goNext} disabled={!preview || Boolean(error)}>
								Continuer vers la vérification
							</ActionButton>
						</div>
					</SurfaceCard>
				</CheckoutStepShell>
			</div>
		</PageShell>
	);
}
