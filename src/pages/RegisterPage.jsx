import AuthShell from '../features/auth/AuthShell.jsx';
import RegisterForm from '../features/auth/RegisterForm.jsx';

export default function RegisterPage({ onSwitchToLogin }) {
	return (
		<AuthShell
			sideContent={
				<div className="space-y-4 text-sm leading-6 text-zinc-700">
					<p>Le changement de type de compte conserve les champs deja saisis.</p>
					<p>Les professionnels renseignent l'adresse de leur entreprise.</p>
				</div>
			}
		>
			<RegisterForm onSwitchToLogin={onSwitchToLogin} />
		</AuthShell>
	);
}
