import { useNavigate } from 'react-router';
import { ActionButton } from '../Button.jsx';
import SoftPanel from '../layout/SoftPanel.jsx';

export default function CartPreview({ items = [], onClose }) {
	const navigate = useNavigate();
	const previewItems = items.slice(0, 3);
	const remaining = Math.max(0, items.length - previewItems.length);
	const total = items.reduce((sum, item) => {
		const priceRaw = item.product.prix ?? item.product.price;
		const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw) : 0;
		return sum + price * item.quantity;
	}, 0);

	const openCart = () => {
		navigate('/panier');
		onClose?.();
	};

	if (!items.length) {
		return (
			<div className="space-y-4">
				<SoftPanel className="text-sm text-neutral-700">Votre panier est vide.</SoftPanel>
				<ActionButton
					type="button"
					onClick={() => {
						navigate('/achat');
						onClose?.();
					}}
					className="w-full"
				>
					Voir les produits
				</ActionButton>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				{previewItems.map((item, index) => (
					<CartPreviewItem key={item.product.idProduit ?? item.product.id ?? item.product._id ?? index} item={item} />
				))}
				{remaining > 0 ? <p className="text-xs font-semibold text-neutral-600">+{remaining} autre(s) produit(s)</p> : null}
			</div>
			<SoftPanel className="flex items-center justify-between px-4 py-3">
				<span className="text-sm font-semibold text-secondary-800">Total estimé</span>
				<span className="text-sm font-bold text-primary-700">{total.toFixed(2)} €</span>
			</SoftPanel>
			<ActionButton
				type="button"
				onClick={openCart}
				className="w-full"
			>
				Voir mon panier
			</ActionButton>
		</div>
	);
}

function CartPreviewItem({ item }) {
	const product = item.product;
	const name = product.nom ?? product.name ?? product.title ?? 'Produit';
	const priceRaw = product.prix ?? product.price;
	const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw).toFixed(2) : '0.00';

	return (
		<SoftPanel className="flex items-center justify-between gap-3 px-3 py-2">
			<div className="min-w-0">
				<p className="truncate text-sm font-semibold text-secondary-900">{name}</p>
				<p className="text-xs text-neutral-600">{price} €</p>
			</div>
			<span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-bold text-primary-800">x{item.quantity}</span>
		</SoftPanel>
	);
}
