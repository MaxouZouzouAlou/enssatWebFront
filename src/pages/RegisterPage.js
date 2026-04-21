import { useState } from 'react';
import AuthShell from '../features/auth/AuthShell';
import { Alert, Field, PrimaryButton, SecondaryButton, TextInput } from '../features/auth/FormControls';
import { authClient, registerAccount } from '../services/auth-client';

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

export default function RegisterPage({ onAuthenticated, onSwitchToLogin }) {
	const [accountType, setAccountType] = useState('particulier');
	const [form, setForm] = useState(emptyForm);
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const update = (field) => (event) => {
		setForm((current) => ({ ...current, [field]: event.target.value }));
	};

	const updateCompany = (field) => (event) => {
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

		if (form.password !== form.confirmPassword) {
			setError('Les mots de passe ne correspondent pas.');
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
		<AuthShell
			sideContent={
				<div className="space-y-4 text-sm leading-6 text-zinc-700">
					<p>Le changement de type de compte conserve les champs deja saisis.</p>
					<p>Les professionnels renseignent l'adresse de leur entreprise.</p>
				</div>
			}
		>
			<div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
				<div className="mb-7">
					<p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Inscription</p>
					<h2 className="mt-2 text-2xl font-semibold text-zinc-950">Creer un compte</h2>
				</div>

				<div className="mb-5 grid grid-cols-2 rounded-md border border-zinc-300 bg-zinc-100 p-1">
					<button
						type="button"
						onClick={() => setAccountType('particulier')}
						className={`h-10 rounded text-sm font-semibold transition ${
							accountType === 'particulier' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'
						}`}
					>
						Particulier
					</button>
					<button
						type="button"
						onClick={() => setAccountType('professionnel')}
						className={`h-10 rounded text-sm font-semibold transition ${
							accountType === 'professionnel' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'
						}`}
					>
						Professionnel
					</button>
				</div>

				<form className="space-y-4" onSubmit={submit}>
					{error ? <Alert>{error}</Alert> : null}
					{success ? <Alert type="success">{success}</Alert> : null}

					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Prenom">
							<TextInput value={form.prenom} onChange={update('prenom')} autoComplete="given-name" required />
						</Field>
						<Field label="Nom">
							<TextInput value={form.nom} onChange={update('nom')} autoComplete="family-name" required />
						</Field>
					</div>

					<Field label="Email">
						<TextInput type="email" value={form.email} onChange={update('email')} autoComplete="email" required />
					</Field>

					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Mot de passe">
							<TextInput
								type="password"
								value={form.password}
								onChange={update('password')}
								autoComplete="new-password"
								minLength={8}
								required
							/>
						</Field>
						<Field label="Confirmation">
							<TextInput
								type="password"
								value={form.confirmPassword}
								onChange={update('confirmPassword')}
								autoComplete="new-password"
								minLength={8}
								required
							/>
						</Field>
					</div>
					

					{accountType === 'professionnel' ? (
						<div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
							<h3 className="text-sm font-semibold text-zinc-950">Entreprise</h3>
							<div className="mt-4 grid gap-4 sm:grid-cols-2">
								<Field label="Nom de l'entreprise">
									<TextInput value={form.entreprise.nom} onChange={updateCompany('nom')} required />
								</Field>
								<Field label="SIRET">
									<TextInput
										value={form.entreprise.siret}
										onChange={updateCompany('siret')}
										inputMode="numeric"
										pattern="[0-9]{14}"
										maxLength={14}
										required
									/>
								</Field>
								<Field label="Adresse de l'entreprise">
									<TextInput value={form.entreprise.adresse_ligne} onChange={updateCompany('adresse_ligne')} required />
								</Field>
								<Field label="Code postal">
									<TextInput value={form.entreprise.code_postal} onChange={updateCompany('code_postal')} required />
								</Field>
								<Field label="Ville">
									<TextInput value={form.entreprise.ville} onChange={updateCompany('ville')} required />
								</Field>
							</div>
						</div>
					) : null}

					<PrimaryButton type="submit" loading={loading}>
						Creer le compte
					</PrimaryButton>
				</form>

				{accountType === 'particulier' ? (
					<>
						<div className="my-5 flex items-center gap-3">
							<div className="h-px flex-1 bg-zinc-200" />
							<span className="text-xs font-medium uppercase tracking-wide text-zinc-500">ou</span>
							<div className="h-px flex-1 bg-zinc-200" />
						</div>
						<SecondaryButton type="button" disabled={googleLoading} onClick={registerWithGoogle}>
							{googleLoading ? 'Redirection...' : 'Creer un compte particulier avec Google'}
						</SecondaryButton>
					</>
				) : null}

				<p className="mt-6 text-center text-sm text-zinc-600">
					Deja inscrit ?{' '}
					<button type="button" className="font-semibold text-emerald-700 hover:text-emerald-800" onClick={onSwitchToLogin}>
						Se connecter
					</button>
				</p>
			</div>
		</AuthShell>
	);
}
