import { useState } from 'react';
import Alert from '../../components/Alert.jsx';
import { PrimaryButton, SecondaryButton } from '../../components/Button.jsx';
import FormField from '../../components/FormField.jsx';
import { authClient, resendVerificationEmail } from '../../services/auth-client';
import { hasErrors, validateLoginForm } from './validation';

export default function LoginForm({ onAuthenticated, onSwitchToRegister }) {
	const [form, setForm] = useState({ email: '', password: '' });
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [error, setError] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});
	const [success, setSuccess] = useState(new URLSearchParams(window.location.search).get('verified') ? 'Email vérifié. Vous pouvez vous connecter.' : '');

	const update = (field) => (event) => {
		setFieldErrors((current) => ({ ...current, [field]: '' }));
		setForm((current) => ({ ...current, [field]: event.target.value }));
	};

	const submit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');

		const nextFieldErrors = validateLoginForm(form);
		setFieldErrors(nextFieldErrors);
		if (hasErrors(nextFieldErrors)) {
			setLoading(false);
			setError('Corrigez les champs indiques.');
			return;
		}

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
		setFieldErrors({});
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
			setError('Renseignez votre email pour renvoyer la vérification.');
			return;
		}
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			await resendVerificationEmail(form.email);
			setSuccess('Email de vérification envoyé.');
		} catch (verificationError) {
			setError(verificationError.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-8">
			<div className="mb-7 space-y-2">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Connexion</p>
				<h2 className="font-title text-3xl font-semibold leading-tight text-secondary-900">Accéder à votre compte</h2>
				<p className="text-sm text-secondary-600">Retrouvez vos commandes et vos favoris locaux.</p>
			</div>

			<form className="space-y-4" onSubmit={submit}>
				{error ? <Alert>{error}</Alert> : null}
				{success ? <Alert type="success">{success}</Alert> : null}
				<FormField
					autoComplete="email"
					error={fieldErrors.email}
					label="Email"
					name="email"
					onChange={update('email')}
					required
					type="email"
					value={form.email}
				/>
				<FormField
					autoComplete="current-password"
					error={fieldErrors.password}
					label="Mot de passe"
					name="password"
					onChange={update('password')}
					required
					toggleVisibility
					type="password"
					value={form.password}
				/>
				<PrimaryButton className="mt-1 h-12 w-full text-base" type="submit" loading={loading}>
					Se connecter
				</PrimaryButton>
			</form>

			<button
				type="button"
				className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700"
				onClick={resendVerification}
			>
				Renvoyer l'email de verification
			</button>

			<div className="my-6 flex items-center gap-3">
				<div className="h-px flex-1 bg-neutral-300" />
				<span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">ou</span>
				<div className="h-px flex-1 bg-neutral-300" />
			</div>

			<SecondaryButton type="button" disabled={googleLoading} onClick={loginWithGoogle}>
				{googleLoading ? 'Redirection...' : 'Continuer avec Google'}
			</SecondaryButton>

			<p className="mt-6 text-center text-sm text-neutral-600">
				Pas encore de compte ?{' '}
				<button type="button" className="font-semibold text-primary-600 hover:text-primary-700" onClick={onSwitchToRegister}>
					Creer un compte
				</button>
			</p>
		</div>
	);
}
