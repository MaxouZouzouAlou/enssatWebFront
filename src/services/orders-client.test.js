import { clearCheckoutContextCache, fetchCheckoutContext, getCachedCheckoutContext } from './orders-client.js';

jest.mock('./auth-client.js', () => ({
	API_BASE_URL: 'http://localhost:3001'
}));

beforeEach(() => {
	clearCheckoutContextCache();
	jest.clearAllMocks();
	global.fetch = jest.fn();
});

test('reuses the cached checkout context while it is still fresh', async () => {
	const payload = { deliveryModes: [{ value: 'point_relais' }] };
	global.fetch.mockResolvedValue({
		ok: true,
		json: jest.fn().mockResolvedValue(payload)
	});

	const firstResult = await fetchCheckoutContext();
	const secondResult = await fetchCheckoutContext();

	expect(firstResult).toEqual(payload);
	expect(secondResult).toEqual(payload);
	expect(getCachedCheckoutContext()).toEqual(payload);
	expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('shares a single pending request between concurrent checkout loads', async () => {
	const payload = { paymentModes: [{ value: 'carte_bancaire' }] };
	let resolveFetch;
	global.fetch.mockReturnValue(
		new Promise((resolve) => {
			resolveFetch = resolve;
		})
	);

	const firstPromise = fetchCheckoutContext();
	const secondPromise = fetchCheckoutContext();

	expect(global.fetch).toHaveBeenCalledTimes(1);

	resolveFetch({
		ok: true,
		json: jest.fn().mockResolvedValue(payload)
	});

	await expect(firstPromise).resolves.toEqual(payload);
	await expect(secondPromise).resolves.toEqual(payload);
});
