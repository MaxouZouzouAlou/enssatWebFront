import { removeCartItem, replaceCartItemQuantity, updateServerCartState } from './cartState';

const items = [
	{ product: { idProduit: 2, nom: 'Courgettes' }, quantity: 1 },
	{ product: { idProduit: 3, nom: 'Tomates' }, quantity: 2 }
];

test('removes a cart item by product id', () => {
	expect(removeCartItem(items, 2)).toEqual([{ product: { idProduit: 3, nom: 'Tomates' }, quantity: 2 }]);
});

test('replaces cart item quantity and drops empty lines', () => {
	expect(replaceCartItemQuantity(items, 3, 1.5)).toEqual([
		{ product: { idProduit: 2, nom: 'Courgettes' }, quantity: 1 },
		{ product: { idProduit: 3, nom: 'Tomates' }, quantity: 1.5 }
	]);

	expect(replaceCartItemQuantity(items, 3, 0)).toEqual([
		{ product: { idProduit: 2, nom: 'Courgettes' }, quantity: 1 }
	]);
});

test('normalizes empty server cart state before applying an updater', () => {
	const updater = updateServerCartState((current) => ({
		...current,
		cartId: 7
	}));

	expect(updater(undefined)).toEqual({
		cartId: 7,
		items: []
	});
});
