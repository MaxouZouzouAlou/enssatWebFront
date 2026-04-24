import { getProductId } from '../cartItems';

export function removeCartItem(items, productId) {
	return (items || []).filter((item) => getProductId(item.product) !== productId);
}

export function replaceCartItemQuantity(items, productId, quantity) {
	return (items || [])
		.map((item) => {
			if (getProductId(item.product) === productId) {
				return { ...item, quantity: Number(quantity.toFixed(3)) };
			}

			return item;
		})
		.filter((item) => item.quantity > 0);
}

export function updateServerCartState(updater) {
	return (current) => {
		const currentState = current || { cartId: null, items: [] };
		return updater(currentState);
	};
}
