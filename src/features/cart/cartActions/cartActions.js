import { addLocalQuantity, getProductId } from '../cartItems';
import { getCartErrorMessage } from '../cartErrorMessages';
import { removeCartItem, replaceCartItemQuantity } from '../cartState/cartState';

export async function addToCartAction({
	product,
	quantity = 1,
	options = {},
	isServerCart,
	setServerCartData,
	setGuestCartItems,
	clearCartError,
	setCartError,
	showError,
	showSuccess,
	shoppingCartService
}) {
	const qty = Number(quantity) || 0;
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
}

export async function removeFromCartAction({
	productId,
	options = {},
	isServerCart,
	setServerCartData,
	setGuestCartItems,
	clearCartError,
	setCartError,
	showError,
	showSuccess,
	shoppingCartService
}) {
	try {
		clearCartError();

		if (isServerCart) {
			await shoppingCartService.removeProductsFromShoppingCart(productId);
			setServerCartData((current) => ({
				...current,
				items: removeCartItem(current.items, productId)
			}));
		} else {
			setGuestCartItems((prev) => removeCartItem(prev, productId));
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
}

export async function updateQuantityAction({
	productId,
	quantity,
	options = {},
	isServerCart,
	cartItems,
	setServerCartData,
	setGuestCartItems,
	clearCartError,
	setCartError,
	showError,
	showSuccess,
	shoppingCartService
}) {
	const nextQty = Number(quantity) || 0;
	const currentItem = (cartItems || []).find((item) => getProductId(item.product) === productId);
	if (!currentItem) return;

	try {
		clearCartError();

		if (nextQty <= 0) {
			if (isServerCart) {
				await shoppingCartService.removeProductsFromShoppingCart(productId);
				setServerCartData((current) => ({
					...current,
					items: removeCartItem(current.items, productId)
				}));
			} else {
				setGuestCartItems((prev) => removeCartItem(prev, productId));
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
				items: replaceCartItemQuantity(current.items, productId, nextQty)
			}));
		} else {
			setGuestCartItems((prev) => replaceCartItemQuantity(prev, productId, nextQty));
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
}
