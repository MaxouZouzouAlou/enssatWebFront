import { useEffect, useMemo, useState } from 'react';
import shoppingCartService from '../services/shoppingCart';

function getProductId(product) {
	return product?.idProduit ?? product?.id ?? product?._id ?? null;
}

function mapCartItem(item) {
	return {
		product: {
			idProduit: item.idProduit,
			id: item.idProduit,
			nom: item.nomProduit ?? item.nom ?? item.name,
			prix: item.prix ?? item.price,
			nature: item.nature,
			stock: item.stock,
			bio: item.bio,
			visible: item.visible,
			unitaireOuKilo: item.unitaireOuKilo,
			tva: item.tva,
			reductionProfessionnel: item.reductionProfessionnel,
			idProfessionnel: item.idProfessionnel,
		},
		quantity: Number(item.quantite ?? item.quantity ?? 1),
	};
}

export default function useCart(profile = null, initial = []) {
	const [cartItems, setCartItems] = useState(initial);
	const [cartOpen, setCartOpen] = useState(false);
	const [cartId, setCartId] = useState(6);

	const addToCart = async (product, quantite = 1) => {
		const qty = Number(quantite) || 0;
		if (qty <= 0) return;
		const productId = getProductId(product);
		if (!productId) return;
		await shoppingCartService.addProductToShoppingCart(cartId, productId, qty);
		setCartItems((prev) => {
			const matchIndex = prev.findIndex((item) => getProductId(item.product) === productId);
			if (matchIndex !== -1) {
				const copy = [...prev];
				copy[matchIndex] = { ...copy[matchIndex], quantity: copy[matchIndex].quantity + qty };
				return copy;
			}
			return [...prev, { product, quantity: qty }];
		});
	};

	const removeFromCart = async (productId) => {
		await shoppingCartService.removerProductsFromShoppingCart(cartId, productId);
		setCartItems((prev) => prev.filter((item) => getProductId(item.product) !== productId));
	};

	const updateQuantity = async (productId, qty) => {
		const nextQty = Number(qty) || 0;
		const currentItem = cartItems.find((item) => getProductId(item.product) === productId);
		if (!currentItem) return;

		if (nextQty <= 0) {
			await shoppingCartService.removerProductsFromShoppingCart(cartId, productId);
			setCartItems((prev) => prev.filter((item) => getProductId(item.product) !== productId));
			return;
		}

		const delta = nextQty - currentItem.quantity;
		if (delta > 0) {
			await shoppingCartService.addProductToShoppingCart(cartId, productId, delta);
		} else if (delta < 0) {
			await shoppingCartService.removeProductFromShoppingCart(cartId, productId, -delta);
		}

		setCartItems((prev) => prev.map((item) => {
			if (getProductId(item.product) === productId) {
				return { ...item, quantity: nextQty };
			}
			return item;
		}).filter((item) => item.quantity > 0));
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
				let resolvedCartId = 6;
				if (profile) {
					const currentCart = await shoppingCartService.getCurrentShoppingCart();
					if (currentCart?.idPanier) {
						resolvedCartId = currentCart.idPanier;
					}
				}

				if (!mounted) return;
				setCartId(resolvedCartId);

				const data = await shoppingCartService.getShoppingCartItems(resolvedCartId);
				if (!mounted) return;
				if (Array.isArray(data)) {
					setCartItems(data.map(mapCartItem));
				} else if (data) {
					setCartItems([mapCartItem(data)]);
				}
			} catch (err) {
				console.warn('Failed to load shopping cart items', err);
			}
		})();
		return () => { mounted = false; };
	}, [profile]);

	return {
		cartItems,
		cartCount,
		cartOpen,
		cartId,
		addToCart,
		removeFromCart,
		updateQuantity,
		openCart,
		closeCart,
		toggleCart,
	};
}
