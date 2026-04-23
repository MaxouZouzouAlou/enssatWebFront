import { useState } from 'react';
import Alert from '../../components/Alert.jsx';
import { PrimaryButton, SecondaryButton } from '../../components/Button.jsx';
import FormField from '../../components/FormField.jsx';
import { GOOGLE_AUTH_ENABLED, authClient, registerAccount } from '../../services/auth-client';
import AccountTypeToggle from './AccountTypeToggle.jsx';
import ProfessionalCompanyFields from './ProfessionalCompanyFields.jsx';
import { hasErrors, normalizeRegisterForm, validateRegisterForm } from './validation';

const verificationEmailStorageKey = 'register-verification-email';
const REGISTER_DRAFT_KEY = 'register-draft';

const emptyForm = {
	email: '',
	nom: '',
	prenom: '',
	password: '',
	confirmPassword: '',
	entreprise: {
		nom: '',
		siret: '',
		adresse_ligne: '',
		code_postal: '',
		ville: ''
	}
};

export default function RegisterForm({ onSwitchToLogin }) {
	const [accountType, setAccountType] = useState(() => {
		const saved = window.sessionStorage.getItem(REGISTER_DRAFT_KEY);
		return saved ? (JSON.parse(saved).accountType || 'particulier') : 'particulier';
	});
	const [form, setForm] = useState(() => {
		const saved = window.sessionStorage.getItem(REGISTER_DRAFT_KEY);
		if (!saved) return emptyForm;
		const { accountType: _at, ...formData } = JSON.parse(saved);
		return { ...emptyForm, ...formData, password: '', confirmPassword: '' };
	});
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [error, setError] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});
	const [success, setSuccess] = useState(() => {
		if (typeof window === 'undefined') return '';
		return window.sessionStorage.getItem(verificationEmailStorageKey) || '';
	});

	const saveDraft = (nextForm, nextAccountType) => {
		window.sessionStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify({
			accountType: nextAccountType,
			...nextForm,
			password: '',
			confirmPassword: ''
		}));
	};

	const clearVerificationState = () => {
		setSuccess('');
		if (typeof window !== 'undefined') {
			window.sessionStorage.removeItem(verificationEmailStorageKey);
		}
	};

	const update = (field) => (event) => {
		setFieldErrors((current) => ({ ...current, [field]: '' }));
		setForm((current) => {
			const next = { ...current, [field]: event.target.value };
			saveDraft(next, accountType);
			return next;
		});
	};

	const updateCompany = (field) => (event) => {
		setFieldErrors((current) => ({ ...current, [`entreprise.${field}`]: '' }));
		setForm((current) => {
			const next = { ...current, entreprise: { ...current.entreprise, [field]: event.target.value } };
			saveDraft(next, accountType);
			return next;
		});
	};

	const changeAccountType = (nextAccountType) => {
		setAccountType(nextAccountType);
		saveDraft(form, nextAccountType);
		setError('');
		setSuccess('');
		setFieldErrors({});
	};

	const submit = async (event) => {
		event.preventDefault();
		setError('');
		setSuccess('');

		const normalizedForm = normalizeRegisterForm(form, accountType);
		const nextFieldErrors = validateRegisterForm(normalizedForm, accountType);
		setFieldErrors(nextFieldErrors);
		if (hasErrors(nextFieldErrors)) {
			setError('Corrigez les champs indiques.');
			return;
		}

		setLoading(true);
		try {
			await registerAccount({
				accountType,
				email: normalizedForm.email,
				nom: normalizedForm.nom,
				prenom: normalizedForm.prenom,
				password: normalizedForm.password,
				entreprise: normalizedForm.entreprise
			});
			window.sessionStorage.removeItem(REGISTER_DRAFT_KEY);
			if (typeof window !== 'undefined') {
				window.sessionStorage.setItem(verificationEmailStorageKey, normalizedForm.email);
			}
			setSuccess(normalizedForm.email);
		} catch (registerError) {
			setError(registerError.message);
		} finally {
			setLoading(false);
		}
	};

	const registerWithGoogle = async () => {
		setGoogleLoading(true);
		setError('');
		setFieldErrors({});
		const { error: authError } = await authClient.signIn.social({
			provider: 'google',
			callbackURL: window.location.origin
		});
		if (authError) {
			setGoogleLoading(false);
			setError(authError.message || 'Inscription Google indisponible.');
		}
	};

	if (success) {
		return (
			<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-8">
				<div className="mb-7 space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Inscription</p>
					<h2 className="font-title text-3xl font-semibold leading-tight text-secondary-900">Vérifiez votre email</h2>
					<p className="text-sm text-secondary-600">
						Un lien de confirmation a été envoyé à <strong>{success}</strong>. Cliquez dessus pour activer votre compte.
					</p>
				</div>
				<p className="text-sm text-secondary-600">Pensez à vérifier vos spams si vous ne voyez pas l'email.</p>
				<button
					type="button"
					className="mt-6 text-sm font-semibold text-primary-600 hover:text-primary-700"
					onClick={() => {
						clearVerificationState();
						onSwitchToLogin();
					}}
				>
					← Retour à la connexion
				</button>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-8">
			<div className="mb-7 space-y-2">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Inscription</p>
				<h2 className="font-title text-3xl font-semibold leading-tight text-secondary-900">Créer un compte</h2>
				<p className="text-sm text-secondary-600">Accédez aux produits locaux et suivez vos achats en toute simplicité.</p>
			</div>

			<AccountTypeToggle accountType={accountType} onChange={changeAccountType} />

			<form className="space-y-4" noValidate onSubmit={submit}>
				{error ? <Alert>{error}</Alert> : null}
				{success ? <Alert type="success">{success}</Alert> : null}

				<div className="grid gap-4 sm:grid-cols-2">
					<FormField
						autoComplete="given-name"
						error={fieldErrors.prenom}
						label="Prenom"
						name="prenom"
						onChange={update('prenom')}
						required
						value={form.prenom}
					/>
					<FormField
						autoComplete="family-name"
						error={fieldErrors.nom}
						label="Nom"
						name="nom"
						onChange={update('nom')}
						required
						value={form.nom}
					/>
				</div>

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

				<div className="grid gap-4 sm:grid-cols-2">
					<FormField
						autoComplete="new-password"
						error={fieldErrors.password}
						help="8 caracteres minimum."
						label="Mot de passe"
						minLength={8}
						name="password"
						onChange={update('password')}
						required
						toggleVisibility
						type="password"
						value={form.password}
					/>
					<FormField
						autoComplete="new-password"
						error={fieldErrors.confirmPassword}
						label="Confirmation"
						minLength={8}
						name="confirmPassword"
						onChange={update('confirmPassword')}
						required
						toggleVisibility
						type="password"
						value={form.confirmPassword}
					/>
				</div>

				{accountType === 'professionnel' ? (
					<ProfessionalCompanyFields
						entreprise={form.entreprise}
						fieldErrors={fieldErrors}
						onChange={updateCompany}
					/>
				) : null}

				<PrimaryButton className="mt-1 h-12 w-full text-base" type="submit" loading={loading}>
					Créer le compte
				</PrimaryButton>
			</form>

			{accountType === 'particulier' && GOOGLE_AUTH_ENABLED ? (
				<>
					<div className="my-6 flex items-center gap-3">
						<div className="h-px flex-1 bg-neutral-300" />
						<span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">ou</span>
						<div className="h-px flex-1 bg-neutral-300" />
					</div>
					<SecondaryButton type="button" disabled={googleLoading} onClick={registerWithGoogle}>
						{googleLoading ? 'Redirection...' : 'Créer un compte particulier avec Google'}
					</SecondaryButton>
				</>
			) : null}

			<p className="mt-6 text-center text-sm text-neutral-600">
				Déjà inscrit ?{' '}
				<button
					type="button"
					className="font-semibold text-primary-600 hover:text-primary-700"
					onClick={() => {
						clearVerificationState();
						onSwitchToLogin();
					}}
				>
					Se connecter
				</button>
			</p>
		</div>
	);
}
