import { useCallback, useEffect, useState } from 'react';
import { authClient, fetchAuthProfile } from '../../services/auth-client';

export default function useAuthProfile() {
	const sessionState = authClient.useSession();
	const [profileState, setProfileState] = useState({
		loading: false,
		error: '',
		data: null
	});

	const loadProfile = useCallback(async () => {
		setProfileState((current) => ({ ...current, loading: true, error: '' }));
		try {
			const data = await fetchAuthProfile();
			setProfileState({ loading: false, error: '', data });
		} catch (error) {
			setProfileState({ loading: false, error: error.message, data: null });
		}
	}, []);

	useEffect(() => {
		if (sessionState.data) {
			loadProfile();
		} else if (!sessionState.isPending) {
			setProfileState({ loading: false, error: '', data: null });
		}
	}, [loadProfile, sessionState.data, sessionState.isPending]);

	const refreshSession = async () => {
		await sessionState.refetch?.();
		await loadProfile();
	};

	const clearProfile = () => {
		setProfileState({ loading: false, error: '', data: null });
	};

	return {
		clearProfile,
		profileState,
		refreshSession,
		sessionState
	};
}
