import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addToCartAction, removeFromCartAction, updateQuantityAction } from '../../features/cart/cartActions/cartActions';
import { EMPTY_CART } from '../../features/cart/cartItems';
import { readGuestCartStorage, writeGuestCartStorage } from '../../features/cart/guestCartStorage';
import { syncServerCart } from '../../features/cart/cartServerSync/cartServerSync';
import { updateServerCartState } from '../../features/cart/cartState/cartState';
import shoppingCartService from '../../services/shoppingCart';
import { queryKeys } from '../../utils/queryKeys.js';

export default function useCart(profile = null, initial = EMPTY_CART, notifications = {}) {
	const initialGuestCart = useMemo(() => readGuestCartStorage(initial), [initial]);
	const [guestCartItems, setGuestCartItems] = useState(initialGuestCart);
	const [cartError, setCartError] = useState(null);
	const isServerCart = Boolean(profile);
	const queryClient = useQueryClient();

	// Tracks local items while not logged in so the login effect can read them
	const localItemsRef = useRef(initialGuestCart);
	const prevProfileRef = useRef(null);
	const {
		showError = () => {},
		showSuccess = () => {}
	} = notifications;

	const clearCartError = () => setCartError(null);

	const cartQuery = useQuery({
		queryKey: queryKeys.cart.current,
		queryFn: () => syncServerCart({
			profile,
			prevProfileRef,
			localItemsRef,
			setGuestCartItems,
			shoppingCartService
		}),
		enabled: isServerCart,
	});

	const setServerCartData = (updater) => {
		queryClient.setQueryData(queryKeys.cart.current, updateServerCartState(updater));
	};

	const addToCart = async (product, quantite = 1, options = {}) => {
		return addToCartAction({
			product,
			quantity: quantite,
			options,
			isServerCart,
			setServerCartData,
			setGuestCartItems,
			clearCartError,
			setCartError,
			showError,
			showSuccess,
			shoppingCartService
		});
	};

	const removeFromCart = async (productId, options = {}) => {
		return removeFromCartAction({
			productId,
			options,
			isServerCart,
			setServerCartData,
			setGuestCartItems,
			clearCartError,
			setCartError,
			showError,
			showSuccess,
			shoppingCartService
		});
	};

	const updateQuantity = async (productId, qty, options = {}) => {
		return updateQuantityAction({
			productId,
			quantity: qty,
			options,
			isServerCart,
			cartItems: isServerCart ? cartQuery.data?.items : guestCartItems,
			setServerCartData,
			setGuestCartItems,
			clearCartError,
			setCartError,
			showError,
			showSuccess,
			shoppingCartService
		});
	};

	const cartItems = useMemo(
		() => (isServerCart ? (cartQuery.data?.items || []) : guestCartItems),
		[isServerCart, cartQuery.data?.items, guestCartItems]
	);
	const cartId = isServerCart ? (cartQuery.data?.cartId ?? null) : null;

	// Count unique products (one per product), not total quantity
	const cartCount = useMemo(() => (cartItems ? cartItems.length : 0), [cartItems]);

	// Keep localItemsRef in sync while not logged in
	useEffect(() => {
		if (!profile) {
			localItemsRef.current = guestCartItems;
			writeGuestCartStorage(guestCartItems);
		}
	}, [profile, guestCartItems]);

	useEffect(() => {
		if (!profile) {
			prevProfileRef.current = null;
			queryClient.removeQueries({ queryKey: queryKeys.cart.current });
		}
	}, [profile, queryClient]);

	return {
		cartItems,
		cartCount,
		cartError,
		cartId,
		addToCart,
		clearCartError,
		removeFromCart,
		updateQuantity,
	};
}
