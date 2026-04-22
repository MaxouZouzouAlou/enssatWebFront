import { useNavigate } from 'react-router';
import { ActionButton } from '../Button.jsx';
import SoftPanel from '../layout/SoftPanel.jsx';
import CartItem from './CartItem.jsx';

export default function CartPreview({ items = [], onClose, removeItem = () => {}, updateQuantity = () => {} }) {
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
						navigate('/produits');
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
			<div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
				{previewItems.map((item, index) => (
					<CartItem
						key={item.product.idProduit ?? item.product.id ?? item.product._id ?? index}
						item={item}
						onRemove={removeItem}
						onUpdate={updateQuantity}
						compact
					/>
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
