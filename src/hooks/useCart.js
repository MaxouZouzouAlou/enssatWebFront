import { useState, useMemo, useEffect } from 'react';
import shoppingCartService from '../services/shoppingCart';

export default function useCart(initial = []) {
	const [cartItems, setCartItems] = useState(initial);
	const [cartOpen, setCartOpen] = useState(false);

	const addToCart = (product) => {
		setCartItems(prev => {
			const matchIndex = prev.findIndex(item => (item.product.idProduit && product.idProduit && item.product.idProduit === product.idProduit) || (item.product.id && product.id && item.product.id === product.id) || (item.product._id && product._id && item.product._id === product._id));
			if (matchIndex !== -1) {
				const copy = [...prev];
				copy[matchIndex] = { ...copy[matchIndex], quantity: copy[matchIndex].quantity + 1 };
				return copy;
			}
			return [...prev, { product, quantity: 1 }];
		});
	};

	const removeFromCart = (productId) => {
		setCartItems(prev => prev.filter(item => !(item.product.idProduit === productId || item.product.id === productId || item.product._id === productId)));
	};

	const updateQuantity = (productId, qty) => {
		setCartItems(prev => prev.map(item => {
			if (item.product.idProduit === productId || item.product.id === productId || item.product._id === productId) {
				return { ...item, quantity: qty };
			}
			return item;
		}).filter(item => item.quantity > 0));
	};

	// Count unique products (one per product), not total quantity
	const cartCount = useMemo(() => (cartItems ? cartItems.length : 0), [cartItems]);

	const openCart = () => setCartOpen(true);
	const closeCart = () => setCartOpen(false);
	const toggleCart = () => setCartOpen(v => !v);

	// Load shopping cart items from backend on mount
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				// idPanier is currently fixed in API calls elsewhere; adjust if dynamic
				const data = await shoppingCartService.getShoppingCartItems(6);
				if (!mounted) return;
				if (Array.isArray(data)) {
					// API returns items with fields like { idProduit, nomProduit, prix, quantite, ... }
					setCartItems(data.map(it => ({
						product: {
							idProduit: it.idProduit,
							id: it.idProduit,
							nom: it.nomProduit ?? it.nom ?? it.name,
							prix: it.prix ?? it.price,
							nature: it.nature,
							stock: it.stock,
							bio: it.bio,
							visible: it.visible,
							tva: it.tva,
							reductionProfessionnel: it.reductionProfessionnel,
							idProfessionnel: it.idProfessionnel,
						},
						quantity: Number(it.quantite ?? it.quantity ?? 1),
					})));
				} else if (data) {
					setCartItems([{
						product: {
							idProduit: data.idProduit,
							id: data.idProduit,
							nom: data.nomProduit ?? data.nom ?? data.name,
							prix: data.prix ?? data.price,
							nature: data.nature,
							stock: data.stock,
							bio: data.bio,
							visible: data.visible,
							tva: data.tva,
							reductionProfessionnel: data.reductionProfessionnel,
							idProfessionnel: data.idProfessionnel,
						},
						quantity: Number(data.quantite ?? data.quantity ?? 1),
					}]);
				}
			} catch (err) {
				console.warn('Failed to load shopping cart items', err);
			}
		})();
		return () => { mounted = false; };
	}, []);

	return {
		cartItems,
		cartCount,
		cartOpen,
		addToCart,
		removeFromCart,
		updateQuantity,
		openCart,
		closeCart,
		toggleCart,
	};
}
