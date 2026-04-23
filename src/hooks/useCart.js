import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import shoppingCartService from '../services/shoppingCart';
import { queryKeys } from '../utils/queryKeys.js';

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

export default function useCart(profile = null, initial = EMPTY_CART, notifications = {}) {
	const initialCartRef = useRef(initial);
	const [guestCartItems, setGuestCartItems] = useState(initial);
	const [cartOpen, setCartOpen] = useState(false);
	const [cartError, setCartError] = useState(null);
	const isServerCart = Boolean(profile);
	const queryClient = useQueryClient();

	// Tracks local items while not logged in so the login effect can read them
	const localItemsRef = useRef(initial);
	const prevProfileRef = useRef(profile);
	const {
		showError = () => {},
		showSuccess = () => {}
	} = notifications;

	const clearCartError = () => setCartError(null);

	const getCartErrorMessage = (err) => {
		const message = err?.message || '';
		if (message.includes('Non authentifi') || message.includes('401')) {
			return 'Votre session a expiré. Reconnectez-vous pour modifier votre panier.';
		}
		if (message.includes('Stock insuffisant')) {
			return 'Stock insuffisant pour ce produit.';
		}
		if (message.includes('Quantite invalide') || message.includes('quantite doit etre entiere')) {
			return 'Quantité invalide pour ce produit.';
		}
		if (message.includes('Produit introuvable')) {
			return "Ce produit n'est plus disponible.";
		}
		return "Impossible de mettre à jour le panier pour le moment.";
	};

	const addLocalQuantity = (currentItems, product, quantity) => {
		const productId = getProductId(product);
		const matchIndex = currentItems.findIndex((item) => getProductId(item.product) === productId);
		if (matchIndex !== -1) {
			const copy = [...currentItems];
			copy[matchIndex] = {
				...copy[matchIndex],
				quantity: Number((copy[matchIndex].quantity + quantity).toFixed(3)),
			};
			return copy;
		}
		return [...currentItems, { product, quantity }];
	};

	const syncServerCart = async () => {
		const currentCart = await shoppingCartService.getCurrentShoppingCart();
		const resolvedCartId = currentCart?.idPanier ?? null;
		if (!resolvedCartId) {
			throw new Error('No shopping cart resolved for current profile');
		}

		const isLoginTransition = !prevProfileRef.current;
		const pendingLocalItems = isLoginTransition ? [...localItemsRef.current] : [];
		prevProfileRef.current = profile;

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
		const items = Array.isArray(data)
			? data.map(mapCartItem)
			: data
				? [mapCartItem(data)]
				: [];

		return {
			cartId: resolvedCartId,
			items
		};
	};

	const cartQuery = useQuery({
		queryKey: queryKeys.cart.current,
		queryFn: syncServerCart,
		enabled: isServerCart,
	});

	const setServerCartData = (updater) => {
		queryClient.setQueryData(queryKeys.cart.current, (current) => {
			const currentState = current || { cartId: null, items: [] };
			return updater(currentState);
		});
	};

	const addToCart = async (product, quantite = 1, options = {}) => {
		const qty = Number(quantite) || 0;
		if (qty <= 0) return;
		const productId = getProductId(product);
		if (!productId) return;
		try {
			clearCartError();
			if (isServerCart) {
				const result = await shoppingCartService.addProductToShoppingCart(productId, qty);
				setServerCartData((current) => ({
					cartId: result?.idPanier ?? current.cartId,
					items: addLocalQuantity(current.items || [], product, qty)
				}));
			} else {
				setGuestCartItems((prev) => addLocalQuantity(prev, product, qty));
			}
			if (options.notify !== false) {
				showSuccess(`${product?.nom || 'Produit'} ajoute au panier.`);
			}
		} catch (err) {
			const message = getCartErrorMessage(err);
			setCartError(message);
			if (options.notify !== false) {
				showError(message);
			}
			throw err;
		}
	};

	const removeFromCart = async (productId, options = {}) => {
		try {
			clearCartError();
			if (isServerCart) {
				await shoppingCartService.removeProductsFromShoppingCart(productId);
				setServerCartData((current) => ({
					...current,
					items: (current.items || []).filter((item) => getProductId(item.product) !== productId)
				}));
			} else {
				setGuestCartItems((prev) => prev.filter((item) => getProductId(item.product) !== productId));
			}
			if (options.notify !== false) {
				showSuccess(options.message || 'Produit retire du panier.');
			}
		} catch (err) {
			const message = getCartErrorMessage(err);
			setCartError(message);
			if (options.notify !== false) {
				showError(message);
			}
			throw err;
		}
	};

	const updateQuantity = async (productId, qty, options = {}) => {
		const nextQty = Number(qty) || 0;
		const currentItem = (isServerCart ? cartQuery.data?.items : guestCartItems)?.find((item) => getProductId(item.product) === productId);
		if (!currentItem) return;

		try {
			clearCartError();
			if (nextQty <= 0) {
				if (isServerCart) {
					await shoppingCartService.removeProductsFromShoppingCart(productId);
					setServerCartData((current) => ({
						...current,
						items: (current.items || []).filter((item) => getProductId(item.product) !== productId)
					}));
				} else {
					setGuestCartItems((prev) => prev.filter((item) => getProductId(item.product) !== productId));
				}
				if (options.notify !== false) {
					showSuccess(options.message || 'Produit retire du panier.');
				}
				return;
			}

			const delta = nextQty - currentItem.quantity;
			if (isServerCart) {
				if (delta > 0) {
					await shoppingCartService.addProductToShoppingCart(productId, delta);
				} else if (delta < 0) {
					await shoppingCartService.removeProductFromShoppingCart(productId, -delta);
				}
				setServerCartData((current) => ({
					...current,
					items: (current.items || []).map((item) => {
						if (getProductId(item.product) === productId) {
							return { ...item, quantity: Number(nextQty.toFixed(3)) };
						}
						return item;
					}).filter((item) => item.quantity > 0)
				}));
			} else {
				setGuestCartItems((prev) => prev.map((item) => {
					if (getProductId(item.product) === productId) {
						return { ...item, quantity: Number(nextQty.toFixed(3)) };
					}
					return item;
				}).filter((item) => item.quantity > 0));
			}
			if (options.notify !== false) {
				showSuccess(options.message || 'Panier mis à jour.');
			}
		} catch (err) {
			const message = getCartErrorMessage(err);
			setCartError(message);
			if (options.notify !== false) {
				showError(message);
			}
			throw err;
		}
	};

	const cartItems = useMemo(
		() => (isServerCart ? (cartQuery.data?.items || []) : guestCartItems),
		[isServerCart, cartQuery.data?.items, guestCartItems]
	);
	const cartId = isServerCart ? (cartQuery.data?.cartId ?? null) : null;

	// Count unique products (one per product), not total quantity
	const cartCount = useMemo(() => (cartItems ? cartItems.length : 0), [cartItems]);

	const openCart = () => setCartOpen(true);
	const closeCart = () => setCartOpen(false);
	const toggleCart = () => setCartOpen(v => !v);

	// Keep localItemsRef in sync while not logged in
	useEffect(() => {
		if (!profile) {
			localItemsRef.current = guestCartItems;
		}
	}, [profile, guestCartItems]);

	useEffect(() => {
		if (!profile) {
			setGuestCartItems(initialCartRef.current);
			prevProfileRef.current = null;
			queryClient.removeQueries({ queryKey: queryKeys.cart.current });
		}
	}, [profile, queryClient]);

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
