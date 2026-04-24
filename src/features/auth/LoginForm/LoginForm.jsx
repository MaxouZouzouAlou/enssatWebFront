import { useState } from 'react';
import Alert from '../../../components/Alert.jsx';
import { PrimaryButton, SecondaryButton } from '../../../components/Button.jsx';
import FormField from '../../../components/FormField.jsx';
import { GOOGLE_AUTH_ENABLED, authClient, requestPasswordReset } from '../../../services/auth-client';
import { useToast } from '../../../app/ToastProvider.jsx';
import { readSearchParam, readSessionJson } from '../authBrowserState.js';
import { hasErrors, validateLoginForm } from '../validation';

const LOGIN_DRAFT_KEY = 'login-draft';

export default function LoginForm({ onAuthenticated, onSwitchToRegister }) {
	const toast = useToast();
	const [form, setForm] = useState(() => {
		const saved = readSessionJson(LOGIN_DRAFT_KEY, null);
		return saved ? { ...saved, password: '' } : { email: '', password: '' };
	});
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [error, setError] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});
	const [success, setSuccess] = useState(
		readSearchParam(typeof window !== 'undefined' ? window.location.search : '', 'verified')
			? 'Email vérifié. Vous pouvez vous connecter.'
			: ''
	);
	const [showForgot, setShowForgot] = useState(false);
	const [forgotEmail, setForgotEmail] = useState('');
	const [forgotLoading, setForgotLoading] = useState(false);

	const update = (field) => (event) => {
		setFieldErrors((current) => ({ ...current, [field]: '' }));
		setForm((current) => {
			const next = { ...current, [field]: event.target.value };
			window.sessionStorage.setItem(LOGIN_DRAFT_KEY, JSON.stringify({ email: next.email }));
			return next;
		});
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
			toast.showError('Corrigez les champs indiques.');
			return;
		}

		const { error: authError } = await authClient.signIn.email({
			email: form.email,
			password: form.password
		});

		setLoading(false);
		if (authError) {
			const message = authError.message || 'Email ou mot de passe invalide.';
			setError(message);
			toast.showError(message);
			return;
		}

		window.sessionStorage.removeItem(LOGIN_DRAFT_KEY);
		toast.showSuccess('Connexion reussie.');
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
			const message = authError.message || 'Connexion Google indisponible.';
			setError(message);
			toast.showError(message);
		}
	};

	const submitForgot = async (event) => {
		event.preventDefault();
		if (!forgotEmail) return;
		setForgotLoading(true);
		setError('');
		setSuccess('');
		try {
			await requestPasswordReset(forgotEmail);
			setSuccess('Si ce compte existe, un email de réinitialisation a été envoyé.');
			toast.showSuccess('Si ce compte existe, un email de réinitialisation a été envoyé.');
			setShowForgot(false);
			setForgotEmail('');
		} catch (err) {
			setError(err.message);
			toast.showError(err.message || "Impossible d'envoyer le lien de réinitialisation.");
		} finally {
			setForgotLoading(false);
		}
	};

	if (showForgot) {
		return (
			<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-8">
				<div className="mb-7 space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Connexion</p>
					<h2 className="font-title text-3xl font-semibold leading-tight text-secondary-900">Mot de passe oublié</h2>
					<p className="text-sm text-secondary-600">Entrez votre email pour recevoir un lien de réinitialisation.</p>
				</div>
				<form className="space-y-4" onSubmit={submitForgot}>
					{error ? <Alert>{error}</Alert> : null}
					{success ? <Alert type="success">{success}</Alert> : null}
					<FormField
						autoComplete="email"
						label="Email"
						name="forgot-email"
						onChange={(e) => setForgotEmail(e.target.value)}
						required
						type="email"
						value={forgotEmail}
					/>
					<PrimaryButton className="mt-1 h-12 w-full text-base" type="submit" loading={forgotLoading}>
						Envoyer le lien
					</PrimaryButton>
				</form>
				<button
					type="button"
					className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700"
					onClick={() => { setShowForgot(false); setError(''); setSuccess(''); }}
				>
					← Retour à la connexion
				</button>
			</div>
		);
	}

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
				onClick={() => { setShowForgot(true); setForgotEmail(form.email); setError(''); setSuccess(''); }}
			>
				Mot de passe oublié ?
			</button>

			{GOOGLE_AUTH_ENABLED ? (
				<>
					<div className="my-6 flex items-center gap-3">
						<div className="h-px flex-1 bg-neutral-300" />
						<span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">ou</span>
						<div className="h-px flex-1 bg-neutral-300" />
					</div>

					<SecondaryButton type="button" disabled={googleLoading} onClick={loginWithGoogle}>
						{googleLoading ? 'Redirection...' : 'Continuer avec Google'}
					</SecondaryButton>
				</>
			) : null}

			<p className="mt-6 text-center text-sm text-neutral-600">
				Pas encore de compte ?{' '}
				<button type="button" className="font-semibold text-primary-600 hover:text-primary-700" onClick={onSwitchToRegister}>
					Créer un compte
				</button>
			</p>
		</div>
	);
}
