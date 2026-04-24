import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import useCheckoutDraft from '../features/checkout/useCheckoutDraft/useCheckoutDraft.js';
import useCheckoutPreview from '../features/checkout/useCheckoutPreview/useCheckoutPreview.js';
import CheckoutStepShell from '../features/checkout/CheckoutStepShell.jsx';
import CheckoutSummaryCard from '../features/checkout/CheckoutSummaryCard/CheckoutSummaryCard.jsx';
import useCheckoutContext from '../features/checkout/useCheckoutContext/useCheckoutContext.js';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { fetchMyLoyalty } from '../services/loyalty-client.js';

export default function CheckoutPaymentPage() {
	const navigate = useNavigate();
	const { accountType, cartItems } = useOutletContext();
	const { draft, saveDraft } = useCheckoutDraft();
	const { data: context, error: contextError } = useCheckoutContext();
	const [loyalty, setLoyalty] = useState(null);
	const [paymentMode, setPaymentMode] = useState(draft.modePaiement || 'carte_bancaire');
	const [voucherId, setVoucherId] = useState(draft.voucherId || null);
	const [error, setError] = useState('');
	const { preview, error: previewError } = useCheckoutPreview({
		payload: {
			modeLivraison: draft.modeLivraison,
			modePaiement: paymentMode,
			relayId: draft.relayId,
			adresseLivraison: draft.adresseLivraison,
			pickupAssignments: draft.pickupAssignments,
			voucherId
		},
		enabled: Boolean(draft.modeLivraison),
		initialPreview: draft.preview || null,
		errorMessage: 'Impossible de recalculer le paiement.'
	});

	useEffect(() => {
		let ignore = false;

		if (accountType === 'particulier') {
			fetchMyLoyalty()
				.then((data) => {
					if (!ignore) setLoyalty(data);
				})
				.catch(() => {
					if (!ignore) setLoyalty(null);
				});
		}

		return () => {
			ignore = true;
		};
	}, [accountType]);

	useEffect(() => {
		if (contextError) {
			setError(contextError.message || 'Impossible de charger le paiement.');
		}
	}, [contextError]);

	useEffect(() => {
		if (previewError) {
			setError(previewError);
			return;
		}

		if (preview) {
			setError('');
		}
	}, [preview, previewError]);

	if (!cartItems.length) {
		return <Navigate to="/panier" replace />;
	}

	if (!draft.modeLivraison) {
		return <Navigate to="/commande/livraison" replace />;
	}

	const goNext = () => {
		saveDraft({
			...draft,
			modePaiement: paymentMode,
			voucherId,
			preview
		});
		navigate('/commande/verification');
	};

	const activeVouchers = (loyalty?.vouchers || []).filter((voucher) => voucher.statut === 'actif');

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

						{accountType === 'particulier' ? (
							<div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
								<p className="text-sm font-semibold text-secondary-900">Bon d'achat</p>
								<p className="mt-1 text-sm text-secondary-600">
									Appliquez un bon actif si vous voulez réduire le total de cette commande.
								</p>
								<div className="mt-4 grid gap-3">
									<label className={`rounded-2xl border px-4 py-4 transition ${!voucherId ? 'border-primary-300 bg-white' : 'border-neutral-200 bg-white'}`}>
										<div className="flex items-start gap-3">
											<input
												type="radio"
												name="voucherId"
												checked={!voucherId}
												onChange={() => setVoucherId(null)}
												className="mt-1 accent-primary-700"
											/>
											<div>
												<p className="font-semibold text-secondary-900">Ne pas utiliser de bon</p>
												<p className="mt-1 text-sm text-secondary-600">Vous conservez vos bons pour une prochaine commande.</p>
											</div>
										</div>
									</label>
									{activeVouchers.map((voucher) => (
										<label key={voucher.idBon} className={`rounded-2xl border px-4 py-4 transition ${voucherId === voucher.idBon ? 'border-primary-300 bg-white' : 'border-neutral-200 bg-white'}`}>
											<div className="flex items-start gap-3">
												<input
													type="radio"
													name="voucherId"
													checked={voucherId === voucher.idBon}
													onChange={() => setVoucherId(voucher.idBon)}
													className="mt-1 accent-primary-700"
												/>
												<div>
													<p className="font-semibold text-secondary-900">{voucher.codeBon}</p>
													<p className="mt-1 text-sm text-secondary-600">
														{Number(voucher.valeurEuros || 0).toFixed(2)} € • expire le {voucher.dateExpiration ? new Date(voucher.dateExpiration).toLocaleDateString('fr-FR') : 'N/A'}
													</p>
												</div>
											</div>
										</label>
									))}
									{!activeVouchers.length ? (
										<p className="text-sm text-secondary-600">Aucun bon actif disponible pour le moment.</p>
									) : null}
								</div>
							</div>
						) : null}

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
