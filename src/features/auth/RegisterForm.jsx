import { useState } from 'react';
import Alert from '../../components/Alert.jsx';
import { PrimaryButton, SecondaryButton } from '../../components/Button.jsx';
import FormField from '../../components/FormField.jsx';
import { authClient, registerAccount } from '../../services/auth-client';
import AccountTypeToggle from './AccountTypeToggle.jsx';
import ProfessionalCompanyFields from './ProfessionalCompanyFields.jsx';
import { hasErrors, validateRegisterForm } from './validation';

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
	const [accountType, setAccountType] = useState('particulier');
	const [form, setForm] = useState(emptyForm);
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [error, setError] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});
	const [success, setSuccess] = useState('');

	const update = (field) => (event) => {
		setFieldErrors((current) => ({ ...current, [field]: '' }));
		setForm((current) => ({ ...current, [field]: event.target.value }));
	};

	const updateCompany = (field) => (event) => {
		setFieldErrors((current) => ({ ...current, [`entreprise.${field}`]: '' }));
		setForm((current) => ({
			...current,
			entreprise: {
				...current.entreprise,
				[field]: event.target.value
			}
		}));
	};

	const submit = async (event) => {
		event.preventDefault();
		setError('');
		setSuccess('');

		const nextFieldErrors = validateRegisterForm(form, accountType);
		setFieldErrors(nextFieldErrors);
		if (hasErrors(nextFieldErrors)) {
			setError('Corrigez les champs indiques.');
			return;
		}

		setLoading(true);
		try {
			await registerAccount({
				accountType,
				email: form.email,
				nom: form.nom,
				prenom: form.prenom,
				password: form.password,
				entreprise: form.entreprise
			});
			setSuccess('Compte cree. Consultez votre email pour verifier le compte avant connexion.');
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

	return (
		<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-8">
			<div className="mb-7 space-y-2">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Inscription</p>
				<h2 className="font-title text-3xl font-semibold leading-tight text-secondary-900">Créer un compte</h2>
				<p className="text-sm text-secondary-600">Accédez aux produits locaux et suivez vos achats en toute simplicité.</p>
			</div>

			<AccountTypeToggle accountType={accountType} onChange={setAccountType} />

			<form className="space-y-4" onSubmit={submit}>
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

			{accountType === 'particulier' ? (
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
				<button type="button" className="font-semibold text-primary-600 hover:text-primary-700" onClick={onSwitchToLogin}>
					Se connecter
				</button>
			</p>
		</div>
	);
}
