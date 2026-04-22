import { act, renderHook, waitFor } from '@testing-library/react';
import useCart from './useCart';
import shoppingCartService from '../services/shoppingCart';

jest.mock('../services/shoppingCart', () => ({
	__esModule: true,
	default: {
		addProductToShoppingCart: jest.fn(),
		getCurrentShoppingCart: jest.fn(),
		getCurrentShoppingCartItems: jest.fn(),
		removeProductFromShoppingCart: jest.fn(),
		removeProductsFromShoppingCart: jest.fn(),
	}
}));

const product = {
	idProduit: 2,
	nom: 'Courgettes',
	prix: 2,
	unitaireOuKilo: false,
};
const authenticatedProfile = { accountType: 'particulier' };
const initialCart = [{ product, quantity: 1 }];

beforeEach(() => {
	jest.clearAllMocks();
});

test('adds products locally for guests without calling the backend', async () => {
	const { result } = renderHook(() => useCart(null));

	await act(async () => {
		await result.current.addToCart(product, 0.5);
	});

	expect(shoppingCartService.addProductToShoppingCart).not.toHaveBeenCalled();
	expect(result.current.cartItems).toEqual([{ product, quantity: 0.5 }]);
	expect(result.current.cartCount).toBe(1);
});

test('uses the backend cart for authenticated profiles', async () => {
	shoppingCartService.getCurrentShoppingCart.mockResolvedValue({ idPanier: 7 });
	shoppingCartService.getCurrentShoppingCartItems.mockResolvedValue([]);
	shoppingCartService.addProductToShoppingCart.mockResolvedValue({ idPanier: 7, idProduit: 2, quantite: 1 });

	const { result } = renderHook(() => useCart(authenticatedProfile));

	await waitFor(() => expect(result.current.cartId).toBe(7));

	await act(async () => {
		await result.current.addToCart(product, 1);
	});

	expect(shoppingCartService.getCurrentShoppingCart).toHaveBeenCalledTimes(1);
	expect(shoppingCartService.getCurrentShoppingCartItems).toHaveBeenCalledTimes(1);
	expect(shoppingCartService.addProductToShoppingCart).toHaveBeenCalledWith(2, 1);
	expect(result.current.cartItems).toEqual([{ product, quantity: 1 }]);
});

test('updates local quantities without backend calls for guests', async () => {
	const { result } = renderHook(() => useCart(null, initialCart));

	await act(async () => {
		await result.current.updateQuantity(2, 1.5);
	});

	expect(shoppingCartService.addProductToShoppingCart).not.toHaveBeenCalled();
	expect(shoppingCartService.removeProductFromShoppingCart).not.toHaveBeenCalled();
	expect(result.current.cartItems).toEqual([{ product, quantity: 1.5 }]);
});

test('exposes a user-facing cart error when a backend update fails', async () => {
	shoppingCartService.getCurrentShoppingCart.mockResolvedValue({ idPanier: 7 });
	shoppingCartService.getCurrentShoppingCartItems.mockResolvedValue([]);
	shoppingCartService.addProductToShoppingCart.mockRejectedValue(new Error('Failed: Stock insuffisant pour ce produit.'));

	const { result } = renderHook(() => useCart(authenticatedProfile));

	await waitFor(() => expect(result.current.cartId).toBe(7));

	let caughtError;
	await act(async () => {
		try {
			await result.current.addToCart(product, 1);
		} catch (err) {
			caughtError = err;
		}
	});

	expect(caughtError.message).toContain('Stock insuffisant');
	expect(result.current.cartError).toBe('Stock insuffisant pour ce produit.');
	expect(result.current.cartItems).toEqual([]);

	act(() => {
		result.current.clearCartError();
	});

	expect(result.current.cartError).toBeNull();
});
