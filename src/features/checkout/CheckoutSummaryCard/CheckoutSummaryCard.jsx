import SurfaceCard from '../../../components/layout/SurfaceCard.jsx';

function estimateLineTotal(item) {
	const quantity = Number(item?.quantity || 0);
	const price = Number(item?.product?.prix ?? item?.product?.price ?? 0);
	const vatRate = Number(item?.product?.tva || 0) / 100;
	const discountRate = Number(item?.product?.reductionProfessionnel || 0) / 100;
	const discountedUnitPrice = price * (1 - discountRate);
	return quantity * discountedUnitPrice * (1 + vatRate);
}

export default function CheckoutSummaryCard({
	preview,
	cartItems = [],
	fallbackDeliveryFees = 0
}) {
	const fallbackSubtotal = cartItems.reduce((sum, item) => sum + estimateLineTotal(item), 0);
	const subtotal = Number(preview?.sousTotalProduits ?? fallbackSubtotal);
	const deliveryFees = Number(preview?.fraisLivraison ?? fallbackDeliveryFees);
	const voucherDiscount = Number(preview?.appliedVoucher?.valeurEuros ?? 0);
	const total = Number(preview?.prixTotal ?? (subtotal + deliveryFees));

	return (
		<SurfaceCard className="p-5">
			<p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary-700">Récapitulatif</p>
			<div className="mt-4 space-y-3">
				{cartItems.map((item) => (
					<div key={item.product.idProduit ?? item.product.id} className="flex items-start justify-between gap-4 text-sm">
						<div>
							<p className="font-medium text-secondary-900">{item.product.nom}</p>
							<p className="text-secondary-500">Quantité : {item.quantity}</p>
						</div>
						<p className="font-semibold text-secondary-900">
							{Number(
								preview?.items?.find((line) => Number(line.idProduit) === Number(item.product.idProduit ?? item.product.id))?.prixTTC
								?? estimateLineTotal(item)
							).toFixed(2)} €
						</p>
					</div>
				))}
			</div>
			<div className="mt-5 space-y-2 border-t border-neutral-200 pt-4 text-sm">
				<div className="flex items-center justify-between">
					<span className="text-secondary-600">Sous-total produits</span>
					<span className="font-semibold text-secondary-900">{subtotal.toFixed(2)} €</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-secondary-600">Frais de livraison</span>
					<span className="font-semibold text-secondary-900">{deliveryFees.toFixed(2)} €</span>
				</div>
				{voucherDiscount > 0 ? (
					<div className="flex items-center justify-between">
						<span className="text-secondary-600">Bon d'achat</span>
						<span className="font-semibold text-primary-700">- {voucherDiscount.toFixed(2)} €</span>
					</div>
				) : null}
				<div className="flex items-center justify-between text-base">
					<span className="font-semibold text-secondary-900">Total estimé</span>
					<span className="font-bold text-secondary-900">{total.toFixed(2)} €</span>
				</div>
			</div>
		</SurfaceCard>
	);
}
