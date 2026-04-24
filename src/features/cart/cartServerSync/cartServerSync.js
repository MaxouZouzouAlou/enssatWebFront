import { getProductId, mapCartItem } from '../cartItems';
import { clearGuestCartStorage, readGuestCartStorage } from '../guestCartStorage';

export async function syncServerCart({
	profile,
	prevProfileRef,
	localItemsRef,
	setGuestCartItems,
	shoppingCartService
}) {
	const currentCart = await shoppingCartService.getCurrentShoppingCart();
	const resolvedCartId = currentCart?.idPanier ?? null;

	if (!resolvedCartId) {
		throw new Error('No shopping cart resolved for current profile');
	}

	const isLoginTransition = !prevProfileRef.current;
	const pendingLocalItems = isLoginTransition
		? readGuestCartStorage(localItemsRef.current)
		: [];

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

	if (pendingLocalItems.length) {
		clearGuestCartStorage();
		localItemsRef.current = [];
		setGuestCartItems([]);
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
}
