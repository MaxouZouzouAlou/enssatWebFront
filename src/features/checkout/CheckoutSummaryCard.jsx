import SurfaceCard from '../../components/layout/SurfaceCard.jsx';

export default function CheckoutSummaryCard({
	preview,
	cartItems = []
}) {
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
							{Number(preview?.items?.find((line) => Number(line.idProduit) === Number(item.product.idProduit ?? item.product.id))?.prixTTC || 0).toFixed(2)} €
						</p>
					</div>
				))}
			</div>
			<div className="mt-5 space-y-2 border-t border-neutral-200 pt-4 text-sm">
				<div className="flex items-center justify-between">
					<span className="text-secondary-600">Sous-total produits</span>
					<span className="font-semibold text-secondary-900">{Number(preview?.sousTotalProduits || 0).toFixed(2)} €</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-secondary-600">Frais de livraison</span>
					<span className="font-semibold text-secondary-900">{Number(preview?.fraisLivraison || 0).toFixed(2)} €</span>
				</div>
				<div className="flex items-center justify-between text-base">
					<span className="font-semibold text-secondary-900">Total estimé</span>
					<span className="font-bold text-secondary-900">{Number(preview?.prixTotal || 0).toFixed(2)} €</span>
				</div>
			</div>
		</SurfaceCard>
	);
}
