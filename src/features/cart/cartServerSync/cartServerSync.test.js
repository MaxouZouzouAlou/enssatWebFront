import { syncServerCart } from './cartServerSync';

jest.mock('../guestCartStorage', () => ({
	clearGuestCartStorage: jest.fn(),
	readGuestCartStorage: jest.fn()
}));

const { clearGuestCartStorage, readGuestCartStorage } = jest.requireMock('../guestCartStorage');

beforeEach(() => {
	jest.clearAllMocks();
});

test('merges guest items on login transition and clears guest cart storage', async () => {
	const guestItems = [{ product: { idProduit: 2 }, quantity: 1.5 }];
	const localItemsRef = {
		current: guestItems
	};
	const prevProfileRef = { current: null };
	const setGuestCartItems = jest.fn();
	const shoppingCartService = {
		getCurrentShoppingCart: jest.fn().mockResolvedValue({ idPanier: 7 }),
		addProductToShoppingCart: jest.fn().mockResolvedValue({}),
		getCurrentShoppingCartItems: jest.fn().mockResolvedValue([
			{
				idProduit: 2,
				nomProduit: 'Courgettes',
				prix: 2,
				unitaireOuKilo: false,
				quantite: 1.5
			}
		])
	};

	readGuestCartStorage.mockReturnValue(guestItems);

	const result = await syncServerCart({
		profile: { accountType: 'particulier' },
		prevProfileRef,
		localItemsRef,
		setGuestCartItems,
		shoppingCartService
	});

	expect(readGuestCartStorage).toHaveBeenCalledWith(guestItems);
	expect(shoppingCartService.addProductToShoppingCart).toHaveBeenCalledWith(2, 1.5);
	expect(clearGuestCartStorage).toHaveBeenCalledTimes(1);
	expect(localItemsRef.current).toEqual([]);
	expect(setGuestCartItems).toHaveBeenCalledWith([]);
	expect(result).toMatchObject({
		cartId: 7,
		items: [
			{
				product: { idProduit: 2, id: 2, nom: 'Courgettes' },
				quantity: 1.5
			}
		]
	});
});

test('skips guest merge when already authenticated before the sync', async () => {
	const localItemsRef = {
		current: [{ product: { idProduit: 2 }, quantity: 1 }]
	};
	const prevProfileRef = { current: { accountType: 'particulier' } };
	const shoppingCartService = {
		getCurrentShoppingCart: jest.fn().mockResolvedValue({ idPanier: 7 }),
		addProductToShoppingCart: jest.fn(),
		getCurrentShoppingCartItems: jest.fn().mockResolvedValue([])
	};

	await syncServerCart({
		profile: { accountType: 'particulier' },
		prevProfileRef,
		localItemsRef,
		setGuestCartItems: jest.fn(),
		shoppingCartService
	});

	expect(readGuestCartStorage).not.toHaveBeenCalled();
	expect(shoppingCartService.addProductToShoppingCart).not.toHaveBeenCalled();
	expect(clearGuestCartStorage).not.toHaveBeenCalled();
});
