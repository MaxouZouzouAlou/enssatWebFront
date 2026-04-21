import { useState } from 'react';
import AuthShell from '../features/auth/AuthShell';
import { Alert, Field, PrimaryButton, SecondaryButton, TextInput } from '../features/auth/FormControls';
import { authClient, resendVerificationEmail } from '../services/auth-client';

export default function LoginPage({ onAuthenticated, onSwitchToRegister }) {
	const [form, setForm] = useState({ email: '', password: '' });
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(new URLSearchParams(window.location.search).get('verified') ? 'Email verifie. Vous pouvez vous connecter.' : '');

	const update = (field) => (event) => {
		setForm((current) => ({ ...current, [field]: event.target.value }));
	};

	const submit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');

		const { error: authError } = await authClient.signIn.email({
			email: form.email,
			password: form.password
		});

		setLoading(false);
		if (authError) {
			setError(authError.message || 'Email ou mot de passe invalide.');
			return;
		}

		onAuthenticated?.();
	};

	const loginWithGoogle = async () => {
		setGoogleLoading(true);
		setError('');
		setSuccess('');
		const { error: authError } = await authClient.signIn.social({
			provider: 'google',
			callbackURL: window.location.origin
		});
		if (authError) {
			setGoogleLoading(false);
			setError(authError.message || 'Connexion Google indisponible.');
		}
	};

	const resendVerification = async () => {
		if (!form.email) {
			setError('Renseignez votre email pour renvoyer la verification.');
			return;
		}
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			await resendVerificationEmail(form.email);
			setSuccess('Email de verification envoye.');
		} catch (verificationError) {
			setError(verificationError.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthShell
			sideContent={
				<div className="space-y-4 text-sm leading-6 text-zinc-700">
					<p>Les sessions sont gerees par cookie securise cote backend.</p>
					<p>Google connecte uniquement des comptes particuliers.</p>
				</div>
			}
		>
			<div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
				<div className="mb-7">
					<p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Connexion</p>
					<h2 className="mt-2 text-2xl font-semibold text-zinc-950">Acceder a votre compte</h2>
				</div>

				<form className="space-y-4" onSubmit={submit}>
					{error ? <Alert>{error}</Alert> : null}
					{success ? <Alert type="success">{success}</Alert> : null}
					<Field label="Email">
						<TextInput
							type="email"
							autoComplete="email"
							value={form.email}
							onChange={update('email')}
							required
						/>
					</Field>
					<Field label="Mot de passe">
						<TextInput
							type="password"
							autoComplete="current-password"
							value={form.password}
							onChange={update('password')}
							required
						/>
					</Field>
					<PrimaryButton type="submit" loading={loading}>
						Se connecter
					</PrimaryButton>
				</form>

				<button
					type="button"
					className="mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
					onClick={resendVerification}
				>
					Renvoyer l'email de verification
				</button>

				<div className="my-5 flex items-center gap-3">
					<div className="h-px flex-1 bg-zinc-200" />
					<span className="text-xs font-medium uppercase tracking-wide text-zinc-500">ou</span>
					<div className="h-px flex-1 bg-zinc-200" />
				</div>

				<SecondaryButton type="button" disabled={googleLoading} onClick={loginWithGoogle}>
					{googleLoading ? 'Redirection...' : 'Continuer avec Google'}
				</SecondaryButton>

				<p className="mt-6 text-center text-sm text-zinc-600">
					Pas encore de compte ?{' '}
					<button type="button" className="font-semibold text-emerald-700 hover:text-emerald-800" onClick={onSwitchToRegister}>
						Creer un compte
					</button>
				</p>
			</div>
		</AuthShell>
	);
}
