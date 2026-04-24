import { formatDeliveryMode } from './CheckoutReviewPage.jsx';

jest.mock('../services/orders-client.js', () => ({
	checkoutCurrentCart: jest.fn(),
	previewCheckout: jest.fn()
}));

test('formats delivery mode labels in the checkout review recap', () => {
	expect(formatDeliveryMode('lieu_vente')).toBe('Retrait en point de vente');
	expect(formatDeliveryMode('point_relais')).toBe('Point relais');
	expect(formatDeliveryMode('domicile')).toBe('Livraison à domicile');
	expect(formatDeliveryMode('')).toBe('Mode de livraison non renseigné');
});
