import { addLocalQuantity, getProductId, mapCartItem } from './cartItems';
import { getCartErrorMessage } from './cartErrorMessages';
import { clearGuestCartStorage, GUEST_CART_STORAGE_KEY, readGuestCartStorage, writeGuestCartStorage } from './guestCartStorage';

const product = {
	idProduit: 2,
	nom: 'Courgettes',
	prix: 2
};

beforeEach(() => {
	window.localStorage.clear();
});

test('maps backend cart items to the frontend cart shape', () => {
	expect(
		mapCartItem({
			idProduit: 2,
			nomProduit: 'Courgettes',
			prix: 2,
			unitaireOuKilo: false,
			quantite: 1.5
		})
	).toEqual({
		product: {
			idProduit: 2,
			id: 2,
			nom: 'Courgettes',
			prix: 2,
			nature: undefined,
			stock: undefined,
			bio: undefined,
			visible: undefined,
			unitaireOuKilo: false,
			tva: undefined,
			reductionProfessionnel: undefined,
			idProfessionnel: undefined
		},
		quantity: 1.5
	});
});

test('adds quantity to an existing local cart line', () => {
	expect(
		addLocalQuantity([{ product, quantity: 1 }], product, 0.5)
	).toEqual([{ product, quantity: 1.5 }]);
	expect(getProductId(product)).toBe(2);
});

test('reads, writes and clears guest cart storage safely', () => {
	writeGuestCartStorage([{ product, quantity: 1 }]);
	expect(readGuestCartStorage()).toEqual([{ product, quantity: 1 }]);

	window.localStorage.setItem(GUEST_CART_STORAGE_KEY, '{invalid json');
	expect(readGuestCartStorage(['fallback'])).toEqual(['fallback']);

	clearGuestCartStorage();
	expect(window.localStorage.getItem(GUEST_CART_STORAGE_KEY)).toBeNull();
});

test('maps backend cart errors to user-facing messages', () => {
	expect(getCartErrorMessage(new Error('401 Non authentifie'))).toContain('session a expiré');
	expect(getCartErrorMessage(new Error('Stock insuffisant'))).toBe('Stock insuffisant pour ce produit.');
	expect(getCartErrorMessage(new Error('Produit introuvable'))).toBe("Ce produit n'est plus disponible.");
	expect(getCartErrorMessage(new Error('Unexpected'))).toBe("Impossible de mettre à jour le panier pour le moment.");
});
