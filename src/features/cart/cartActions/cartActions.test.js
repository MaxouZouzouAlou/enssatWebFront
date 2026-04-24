import { addToCartAction, removeFromCartAction, updateQuantityAction } from './cartActions';

const product = {
	idProduit: 2,
	nom: 'Courgettes'
};

function createDeps(overrides = {}) {
	return {
		options: {},
		isServerCart: false,
		cartItems: [{ product, quantity: 1 }],
		setServerCartData: jest.fn(),
		setGuestCartItems: jest.fn(),
		clearCartError: jest.fn(),
		setCartError: jest.fn(),
		showError: jest.fn(),
		showSuccess: jest.fn(),
		shoppingCartService: {
			addProductToShoppingCart: jest.fn().mockResolvedValue({ idPanier: 7 }),
			removeProductsFromShoppingCart: jest.fn().mockResolvedValue({}),
			removeProductFromShoppingCart: jest.fn().mockResolvedValue({})
		},
		...overrides
	};
}

test('adds a guest product locally and shows success feedback', async () => {
	const deps = createDeps();

	await addToCartAction({
		...deps,
		product,
		quantity: 1.5
	});

	expect(deps.clearCartError).toHaveBeenCalledTimes(1);
	expect(deps.setGuestCartItems).toHaveBeenCalledTimes(1);
	expect(deps.shoppingCartService.addProductToShoppingCart).not.toHaveBeenCalled();
	expect(deps.showSuccess).toHaveBeenCalledWith('Courgettes ajoute au panier.');
});

test('removes a server cart item through the API', async () => {
	const deps = createDeps({ isServerCart: true });

	await removeFromCartAction({
		...deps,
		productId: 2
	});

	expect(deps.shoppingCartService.removeProductsFromShoppingCart).toHaveBeenCalledWith(2);
	expect(deps.setServerCartData).toHaveBeenCalledTimes(1);
});

test('updates a server quantity by delta and rewrites the cached item list', async () => {
	const deps = createDeps({ isServerCart: true });

	await updateQuantityAction({
		...deps,
		productId: 2,
		quantity: 2.5
	});

	expect(deps.shoppingCartService.addProductToShoppingCart).toHaveBeenCalledWith(2, 1.5);
	expect(deps.shoppingCartService.removeProductFromShoppingCart).not.toHaveBeenCalled();
	expect(deps.setServerCartData).toHaveBeenCalledTimes(1);
});

test('maps backend failures to user-facing cart errors', async () => {
	const deps = createDeps({
		isServerCart: true,
		shoppingCartService: {
			addProductToShoppingCart: jest.fn().mockRejectedValue(new Error('Stock insuffisant')),
			removeProductsFromShoppingCart: jest.fn(),
			removeProductFromShoppingCart: jest.fn()
		}
	});

	await expect(
		addToCartAction({
			...deps,
			product,
			quantity: 1
		})
	).rejects.toThrow('Stock insuffisant');

	expect(deps.setCartError).toHaveBeenCalledWith('Stock insuffisant pour ce produit.');
	expect(deps.showError).toHaveBeenCalledWith('Stock insuffisant pour ce produit.');
});
