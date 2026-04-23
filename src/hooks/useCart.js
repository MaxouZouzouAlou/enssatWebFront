import { useEffect, useMemo, useRef, useState } from 'react';
import shoppingCartService from '../services/shoppingCart';

const EMPTY_CART = [];

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

export default function useCart(profile = null, initial = EMPTY_CART) {
	const initialCartRef = useRef(initial);
	const [cartItems, setCartItems] = useState(initial);
	const [cartOpen, setCartOpen] = useState(false);
	const [cartError, setCartError] = useState(null);
	const [cartId, setCartId] = useState(null);
	const isServerCart = Boolean(profile);

	// Tracks local items while not logged in so the login effect can read them
	const localItemsRef = useRef(initial);
	const prevProfileRef = useRef(profile);

	const clearCartError = () => setCartError(null);

	const getCartErrorMessage = (err) => {
		const message = err?.message || '';
		if (message.includes('Non authentifie') || message.includes('401')) {
			return 'Votre session a expire. Reconnectez-vous pour modifier votre panier.';
		}
		if (message.includes('Stock insuffisant')) {
			return 'Stock insuffisant pour ce produit.';
		}
		if (message.includes('Quantite invalide') || message.includes('quantite doit etre entiere')) {
			return 'Quantite invalide pour ce produit.';
		}
		if (message.includes('Produit introuvable')) {
			return 'Ce produit n est plus disponible.';
		}
		return "Impossible de mettre a jour le panier pour le moment.";
	};

	const addLocalQuantity = (product, quantity) => {
		const productId = getProductId(product);
		setCartItems((prev) => {
			const matchIndex = prev.findIndex((item) => getProductId(item.product) === productId);
			if (matchIndex !== -1) {
				const copy = [...prev];
				copy[matchIndex] = {
					...copy[matchIndex],
					quantity: Number((copy[matchIndex].quantity + quantity).toFixed(3)),
				};
				return copy;
			}
			return [...prev, { product, quantity }];
		});
	};

	const addToCart = async (product, quantite = 1) => {
		const qty = Number(quantite) || 0;
		if (qty <= 0) return;
		const productId = getProductId(product);
		if (!productId) return;
		try {
			clearCartError();
			if (isServerCart) {
				const result = await shoppingCartService.addProductToShoppingCart(productId, qty);
				if (result?.idPanier) setCartId(result.idPanier);
			}
			addLocalQuantity(product, qty);
		} catch (err) {
			setCartError(getCartErrorMessage(err));
			throw err;
		}
	};

	const removeFromCart = async (productId) => {
		try {
			clearCartError();
			if (isServerCart) {
				await shoppingCartService.removeProductsFromShoppingCart(productId);
			}
			setCartItems((prev) => prev.filter((item) => getProductId(item.product) !== productId));
		} catch (err) {
			setCartError(getCartErrorMessage(err));
			throw err;
		}
	};

	const updateQuantity = async (productId, qty) => {
		const nextQty = Number(qty) || 0;
		const currentItem = cartItems.find((item) => getProductId(item.product) === productId);
		if (!currentItem) return;

		try {
			clearCartError();
			if (nextQty <= 0) {
				if (isServerCart) {
					await shoppingCartService.removeProductsFromShoppingCart(productId);
				}
				setCartItems((prev) => prev.filter((item) => getProductId(item.product) !== productId));
				return;
			}

			const delta = nextQty - currentItem.quantity;
			if (isServerCart) {
				if (delta > 0) {
					await shoppingCartService.addProductToShoppingCart(productId, delta);
				} else if (delta < 0) {
					await shoppingCartService.removeProductFromShoppingCart(productId, -delta);
				}
			}

			setCartItems((prev) => prev.map((item) => {
				if (getProductId(item.product) === productId) {
					return { ...item, quantity: Number(nextQty.toFixed(3)) };
				}
				return item;
			}).filter((item) => item.quantity > 0));
		} catch (err) {
			setCartError(getCartErrorMessage(err));
			throw err;
		}
	};

	// Count unique products (one per product), not total quantity
	const cartCount = useMemo(() => (cartItems ? cartItems.length : 0), [cartItems]);

	const openCart = () => setCartOpen(true);
	const closeCart = () => setCartOpen(false);
	const toggleCart = () => setCartOpen(v => !v);

	// Keep localItemsRef in sync while not logged in
	useEffect(() => {
		if (!profile) {
			localItemsRef.current = cartItems;
		}
	}, [profile, cartItems]);

	// Load (and optionally merge local items into) the server cart on login
	useEffect(() => {
		let mounted = true;
		if (!profile) {
			setCartId(null);
			setCartItems(initialCartRef.current);
			prevProfileRef.current = null;
			return () => { mounted = false; };
		}

		// Detect transition from unauthenticated → authenticated
		const isLoginTransition = !prevProfileRef.current;
		const pendingLocalItems = isLoginTransition ? [...localItemsRef.current] : [];
		prevProfileRef.current = profile;

		(async () => {
			try {
				const currentCart = await shoppingCartService.getCurrentShoppingCart();
				const resolvedCartId = currentCart?.idPanier ?? null;
				if (!resolvedCartId) {
					throw new Error('No shopping cart resolved for current profile');
				}

				if (!mounted) return;
				setCartId(resolvedCartId);

				// Merge pre-login local items into the server cart (best-effort)
				for (const item of pendingLocalItems) {
					const productId = getProductId(item.product);
					if (!productId) continue;
					try {
						await shoppingCartService.addProductToShoppingCart(productId, item.quantity);
					} catch {
						// Silent: stock issues, deleted products, etc.
					}
				}

				const data = await shoppingCartService.getCurrentShoppingCartItems();
				if (!mounted) return;
				if (Array.isArray(data)) {
					setCartItems(data.map(mapCartItem));
				} else if (data) {
					setCartItems([mapCartItem(data)]);
				} else {
					setCartItems([]);
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
		cartError,
		cartId,
		addToCart,
		clearCartError,
		removeFromCart,
		updateQuantity,
		openCart,
		closeCart,
		toggleCart,
	};
}
