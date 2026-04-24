import { useQuery } from '@tanstack/react-query';
import { fetchCheckoutContext } from '../../../services/orders-client/orders-client.js';
import { queryKeys } from '../../../utils/queryKeys.js';

export function buildCheckoutContextQueryOptions() {
	return {
		queryKey: queryKeys.checkout.context,
		queryFn: fetchCheckoutContext,
		staleTime: 30_000
	};
}

export function prefetchCheckoutContext(queryClient) {
	return queryClient.prefetchQuery(buildCheckoutContextQueryOptions());
}

export default function useCheckoutContext(options = {}) {
	return useQuery({
		...buildCheckoutContextQueryOptions(),
		...options
	});
}
