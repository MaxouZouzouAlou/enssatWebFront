import React from 'react';
import { useOutletContext } from 'react-router';
import Alert from '../components/Alert.jsx';
import CartItem from '../components/header/CartItem';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';

function PanierPage() {
	const { cartError, cartItems, clearCartError, removeFromCart, updateQuantity } = useOutletContext();
	const total = cartItems.reduce((s, it) => {
		const priceRaw = it.product.prix ?? it.product.price;
		const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw) : 0;
		return s + price * it.quantity;
	}, 0);

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

			<SurfaceCard className="mt-8">
				{cartItems.length === 0 ? (
					<div className="py-10 text-center text-neutral-600">Votre panier est vide.</div>
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
					</div>
				)}
			</SurfaceCard>
		</PageShell>
	);
}

export default PanierPage;
