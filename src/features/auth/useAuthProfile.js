import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient, fetchAuthProfile } from '../../services/auth-client';
import { queryKeys } from '../../utils/queryKeys.js';

export default function useAuthProfile() {
	const sessionState = authClient.useSession();
	const queryClient = useQueryClient();

	const profileQuery = useQuery({
		queryKey: queryKeys.auth.profile,
		queryFn: fetchAuthProfile,
		enabled: Boolean(sessionState.data),
	});

	const refreshSession = async () => {
		await sessionState.refetch?.();
		if (sessionState.data) {
			await queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
			return;
		}
		await queryClient.removeQueries({ queryKey: queryKeys.auth.profile });
	};

	const clearProfile = useCallback(() => {
		queryClient.removeQueries({ queryKey: queryKeys.auth.profile });
	}, [queryClient]);

	const profileState = sessionState.data
		? {
			loading: profileQuery.isLoading || profileQuery.isFetching,
			error: profileQuery.error?.message || '',
			data: profileQuery.data ?? null
		}
		: {
			loading: false,
			error: '',
			data: null
		};

	return {
		clearProfile,
		profileState,
		refreshSession,
		sessionState
	};
}
