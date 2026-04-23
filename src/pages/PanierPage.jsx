import React, { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import Alert from '../components/Alert.jsx';
import { ActionButton } from '../components/Button.jsx';
import CartItem from '../components/header/CartItem';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { clearCheckoutDraft } from '../features/checkout/checkoutDraft.js';

function estimateLineTotal(item) {
	const quantity = Number(item.quantity || 0);
	const price = Number(item.product.prix ?? item.product.price ?? 0);
	const vatRate = Number(item.product.tva || 0) / 100;
	const discountRate = Number(item.product.reductionProfessionnel || 0) / 100;
	const discountedUnitPrice = price * (1 - discountRate);
	return quantity * discountedUnitPrice * (1 + vatRate);
}

export default function PanierPage() {
	const navigate = useNavigate();
	const {
		cartError,
		cartItems,
		clearCartError,
		removeFromCart,
		updateQuantity,
		isAuthenticated
	} = useOutletContext();
	const total = useMemo(
		() => cartItems.reduce((sum, item) => sum + estimateLineTotal(item), 0),
		[cartItems]
	);

	const startCheckout = () => {
		clearCheckoutDraft();
		if (!isAuthenticated) {
			navigate('/login');
			return;
		}
		navigate('/commande/livraison');
	};

	return (
		<PageShell contentClassName="max-w-4xl">
			<SectionHeader eyebrow="Commande" title="Votre panier">
				<p>Vérifiez vos articles ici, puis poursuivez vers un checkout guidé étape par étape.</p>
			</SectionHeader>
			{cartError ? (
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
			) : null}

			<SurfaceCard className="mt-8">
				{cartItems.length === 0 ? (
					<div className="py-10 text-center text-neutral-600">
						<p>Votre panier est vide.</p>
					</div>
				) : (
					<div className="space-y-4">
						{cartItems.map((item, index) => (
							<CartItem
								key={item.product.idProduit ?? item.product.id ?? index}
								item={item}
								onRemove={removeFromCart}
								onUpdate={updateQuantity}
							/>
						))}

						<div className="rounded-2xl border border-neutral-200 bg-[#fcfaf5] p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-lg font-semibold text-secondary-900">Total estimé</p>
									<p className="mt-1 text-sm text-secondary-600">
										Les frais de livraison seront ajoutés à l étape suivante selon le mode choisi.
									</p>
								</div>
								<p className="text-2xl font-bold text-secondary-900">{total.toFixed(2)} €</p>
							</div>
							<div className="mt-4 flex flex-wrap justify-end gap-3">
								<ActionButton type="button" variant="secondary" onClick={() => navigate('/produits')}>
									Continuer mes achats
								</ActionButton>
								<ActionButton type="button" onClick={startCheckout}>
									Passer à la commande
								</ActionButton>
							</div>
						</div>
					</div>
				)}
			</SurfaceCard>
		</PageShell>
	);
}
