import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import useCheckoutContext, { prefetchCheckoutContext } from './useCheckoutContext';
import { queryKeys } from '../../../utils/queryKeys.js';

jest.mock('../../../services/orders-client/orders-client.js', () => ({
	fetchCheckoutContext: jest.fn()
}));

const { fetchCheckoutContext } = jest.requireMock('../../../services/orders-client/orders-client.js');

function createWrapper(queryClient) {
	return function Wrapper({ children }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

beforeEach(() => {
	jest.clearAllMocks();
});

test('loads checkout context through react query', async () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false }
		}
	});

	fetchCheckoutContext.mockResolvedValue({ deliveryModes: [{ value: 'point_relais' }] });

	const { result } = renderHook(() => useCheckoutContext(), {
		wrapper: createWrapper(queryClient)
	});

	await waitFor(() => expect(result.current.data).toEqual({ deliveryModes: [{ value: 'point_relais' }] }));
	expect(fetchCheckoutContext).toHaveBeenCalledTimes(1);
});

test('prefetches checkout context into the shared query cache', async () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false }
		}
	});

	fetchCheckoutContext.mockResolvedValue({ paymentModes: [{ value: 'carte_bancaire' }] });

	await prefetchCheckoutContext(queryClient);

	expect(queryClient.getQueryData(queryKeys.checkout.context)).toEqual({
		paymentModes: [{ value: 'carte_bancaire' }]
	});
});
