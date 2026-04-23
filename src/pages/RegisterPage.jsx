import AuthShell from '../features/auth/AuthShell.jsx';
import RegisterForm from '../features/auth/RegisterForm.jsx';

export default function RegisterPage({ onSwitchToLogin }) {
	return (
		<AuthShell leftTitle="Création de compte">
			<RegisterForm onSwitchToLogin={onSwitchToLogin} />
		</AuthShell>
	);
}
