import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import Alert from '../components/Alert.jsx';
import { PrimaryButton } from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import AuthShell from '../features/auth/AuthShell.jsx';
import { resetPassword } from '../services/auth-client';

export default function ResetPasswordPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const token = searchParams.get('token');

	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	if (!token) {
		return (
			<AuthShell leftTitle="Réinitialisation du mot de passe">
				<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-8">
					<Alert>Lien invalide ou expiré. Demandez un nouveau lien depuis la page de connexion.</Alert>
					<button
						type="button"
						className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700"
						onClick={() => navigate('/login')}
					>
						← Retour à la connexion
					</button>
				</div>
			</AuthShell>
		);
	}

	const submit = async (event) => {
		event.preventDefault();
		setError('');
		if (password.length < 8) {
			setError('Le mot de passe doit contenir au moins 8 caractères.');
			return;
		}
		if (password !== confirm) {
			setError('Les mots de passe ne correspondent pas.');
			return;
		}
		setLoading(true);
		try {
			await resetPassword(token, password);
			setSuccess('Mot de passe mis à jour. Vous pouvez vous connecter.');
		} catch (err) {
			setError(err.message || 'Lien invalide ou expiré.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthShell leftTitle="Nouveau mot de passe">
			<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-8">
				<div className="mb-7 space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Sécurité</p>
					<h2 className="font-title text-3xl font-semibold leading-tight text-secondary-900">Nouveau mot de passe</h2>
					<p className="text-sm text-secondary-600">Choisissez un mot de passe d'au moins 8 caractères.</p>
				</div>

				{success ? (
					<>
						<Alert type="success">{success}</Alert>
						<button
							type="button"
							className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700"
							onClick={() => navigate('/login')}
						>
							Se connecter
						</button>
					</>
				) : (
					<form className="space-y-4" onSubmit={submit}>
						{error ? <Alert>{error}</Alert> : null}
						<FormField
							autoComplete="new-password"
							label="Nouveau mot de passe"
							name="password"
							onChange={(e) => setPassword(e.target.value)}
							required
							toggleVisibility
							type="password"
							value={password}
						/>
						<FormField
							autoComplete="new-password"
							label="Confirmer le mot de passe"
							name="confirm"
							onChange={(e) => setConfirm(e.target.value)}
							required
							toggleVisibility
							type="password"
							value={confirm}
						/>
						<PrimaryButton className="mt-1 h-12 w-full text-base" type="submit" loading={loading}>
							Enregistrer le mot de passe
						</PrimaryButton>
					</form>
				)}
			</div>
		</AuthShell>
	);
}
