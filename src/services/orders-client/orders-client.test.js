import { fetchCheckoutContext } from './orders-client.js';

jest.mock('../api-config.js', () => ({
	API_BASE_URL: 'http://localhost:3001'
}));

beforeEach(() => {
	jest.clearAllMocks();
	global.fetch = jest.fn();
});

test('loads the checkout context payload', async () => {
	const payload = { deliveryModes: [{ value: 'point_relais' }] };
	global.fetch.mockResolvedValue({
		ok: true,
		json: jest.fn().mockResolvedValue(payload)
	});

	const result = await fetchCheckoutContext();

	expect(result).toEqual(payload);
	expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('throws a readable error when checkout context loading fails', async () => {
	global.fetch.mockResolvedValue({
		ok: false,
		headers: new Headers({ 'content-type': 'application/json' }),
		text: jest.fn().mockResolvedValue(JSON.stringify({ error: 'Contexte indisponible' }))
	});

	await expect(fetchCheckoutContext()).rejects.toThrow('Contexte indisponible');
});
