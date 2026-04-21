import '../styles/App.css';
import { useCallback, useEffect, useState } from 'react';
import { authClient, fetchAuthProfile } from '../services/auth-client';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

function App() {
	const sessionState = authClient.useSession();
	const [view, setView] = useState('login');
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

	const refreshSession = async () => {
		await sessionState.refetch?.();
		await loadProfile();
	};

	useEffect(() => {
		if (sessionState.data) {
			loadProfile();
		} else if (!sessionState.isPending) {
			setProfileState({ loading: false, error: '', data: null });
		}
	}, [loadProfile, sessionState.data, sessionState.isPending]);

	const signOut = async () => {
		await authClient.signOut();
		setProfileState({ loading: false, error: '', data: null });
		await sessionState.refetch?.();
		setView('login');
	};

	if (sessionState.isPending) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-700">
				Chargement...
			</main>
		);
	}

	if (sessionState.data) {
		const profile = profileState.data?.profile;
		const user = sessionState.data.user;

		return (
			<main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
				<section className="mx-auto max-w-4xl rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
					<div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Session active</p>
							<h1 className="mt-2 text-2xl font-semibold">{user.name}</h1>
							<p className="mt-1 text-sm text-zinc-600">{user.email}</p>
						</div>
						<button
							type="button"
							onClick={signOut}
							className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
						>
							Se deconnecter
						</button>
					</div>

					<div className="mt-6 grid gap-4 sm:grid-cols-2">
						<div className="rounded-md border border-zinc-200 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Type de compte</p>
							<p className="mt-2 text-lg font-semibold text-zinc-950">{profile?.accountType || 'Non renseigne'}</p>
						</div>
						<div className="rounded-md border border-zinc-200 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Email verifie</p>
							<p className="mt-2 text-lg font-semibold text-zinc-950">{user.emailVerified ? 'Oui' : 'Non'}</p>
						</div>
					</div>

					{profileState.loading ? <p className="mt-6 text-sm text-zinc-600">Chargement du profil...</p> : null}
					{profileState.error ? <p className="mt-6 text-sm text-red-700">{profileState.error}</p> : null}

					{profile?.professionnel ? (
						<div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 p-4">
							<p className="text-sm font-semibold text-zinc-950">Entreprise</p>
							<p className="mt-2 text-sm text-zinc-700">{profile.professionnel.entreprise.nom}</p>
							<p className="text-sm text-zinc-700">SIRET {profile.professionnel.entreprise.siret}</p>
							<p className="text-sm text-zinc-700">{profile.professionnel.entreprise.adresse_ligne}</p>
							<p className="text-sm text-zinc-700">
								{profile.professionnel.entreprise.code_postal} {profile.professionnel.entreprise.ville}
							</p>
						</div>
					) : null}
				</section>
			</main>
		);
	}

	return (
		<div>
			{view === 'login' ? (
				<LoginPage onAuthenticated={refreshSession} onSwitchToRegister={() => setView('register')} />
			) : (
				<RegisterPage onAuthenticated={refreshSession} onSwitchToLogin={() => setView('login')} />
			)}
		</div>
	);
}

export default App;
