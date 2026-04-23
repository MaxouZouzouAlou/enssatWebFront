import React, { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import Alert from '../components/Alert.jsx';
import { ActionButton } from '../components/Button.jsx';
import CartItem from '../components/header/CartItem';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { checkoutCurrentCart } from '../services/orders-client.js';

function estimateLineTotal(item) {
	const quantity = Number(item.quantity || 0);
	const price = Number(item.product.prix ?? item.product.price ?? 0);
	const vatRate = Number(item.product.tva || 0) / 100;
	const discountRate = Number(item.product.reductionProfessionnel || 0) / 100;
	const discountedUnitPrice = price * (1 - discountRate);
	return quantity * discountedUnitPrice * (1 + vatRate);
}

function PanierPage() {
	const navigate = useNavigate();
	const {
		cartError,
		cartItems,
		clearCartError,
		removeFromCart,
		updateQuantity,
		isAuthenticated
	} = useOutletContext();
	const [checkoutError, setCheckoutError] = useState('');
	const [checkoutSuccess, setCheckoutSuccess] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [modeLivraison, setModeLivraison] = useState('domicile');
	const total = useMemo(
		() => cartItems.reduce((sum, item) => sum + estimateLineTotal(item), 0),
		[cartItems]
	);

	const submitCheckout = async () => {
		if (!isAuthenticated) {
			navigate('/login');
			return;
		}

		setIsSubmitting(true);
		setCheckoutError('');
		setCheckoutSuccess(null);

		try {
			const result = await checkoutCurrentCart({ modeLivraison });
			await Promise.all(
				cartItems.map((item) => updateQuantity(item.product.idProduit ?? item.product.id, 0))
			);
			setCheckoutSuccess(result.order);
		} catch (error) {
			setCheckoutError(error.message || 'Impossible de valider la commande.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<PageShell contentClassName="max-w-4xl">
			<SectionHeader eyebrow="Commande" title="Votre panier">
				<p>Retrouvez les produits sélectionnés avant de choisir votre mode de récupération.</p>
			</SectionHeader>
			{cartError && (
				<div className="mt-6">
					<Alert>
						<div className="flex items-start justify-between gap-4">
							<span>{cartError}</span>
							<button
								type="button"
								onClick={clearCartError}
								className="text-xs font-semibold uppercase tracking-[0.12em] text-red-800 hover:text-red-950"
							>
								Fermer
							</button>
						</div>
					</Alert>
				</div>
			)}
			{checkoutError ? (
				<div className="mt-6">
					<Alert>{checkoutError}</Alert>
				</div>
			) : null}
			{checkoutSuccess ? (
				<div className="mt-6">
					<Alert type="success">
						Commande #{checkoutSuccess.idCommande} enregistrée pour un total de {checkoutSuccess.prixTotal.toFixed(2)} €.
					</Alert>
				</div>
			) : null}

			<SurfaceCard className="mt-8">
				{cartItems.length === 0 ? (
					<div className="space-y-3 py-10 text-center text-neutral-600">
						<p>Votre panier est vide.</p>
						{checkoutSuccess ? (
							<p className="text-sm text-primary-700">Votre commande est confirmée. Vous pouvez continuer vos achats.</p>
						) : null}
					</div>
				) : (
					<div className="space-y-4">
						{cartItems.map((it, idx) => (
							<CartItem
								key={it.product.idProduit ?? it.product.id ?? it.product._id ?? idx}
								item={it}
								onRemove={removeFromCart}
								onUpdate={updateQuantity}
							/>
						))}

						<div className="flex items-center justify-between rounded-2xl bg-primary-50 px-4 py-3">
							<div className="text-lg font-semibold text-secondary-900">Total estimé</div>
							<div className="text-lg font-bold text-primary-700">{total.toFixed(2)} €</div>
						</div>

						<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
							<div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
								<label className="block text-sm font-semibold text-secondary-900" htmlFor="mode-livraison">
									Mode de récupération
									<select
										id="mode-livraison"
										value={modeLivraison}
										onChange={(event) => setModeLivraison(event.target.value)}
										className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-secondary-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
									>
										<option value="domicile">Livraison à domicile</option>
										<option value="point_relais">Point relais</option>
										<option value="lieu_vente">Retrait sur place</option>
									</select>
								</label>

								<ActionButton
									type="button"
									onClick={submitCheckout}
									loading={isSubmitting}
									className="w-full sm:w-auto"
								>
									Valider la commande
								</ActionButton>
							</div>
							{!isAuthenticated ? (
								<p className="mt-3 text-sm text-neutral-600">
									Connectez-vous pour transformer ce panier en commande réelle.
								</p>
							) : null}
						</div>
					</div>
				)}
			</SurfaceCard>
		</PageShell>
	);
}

export default PanierPage;
