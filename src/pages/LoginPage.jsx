import AuthShell from '../features/auth/AuthShell.jsx';
import LoginForm from '../features/auth/LoginForm.jsx';

export default function LoginPage({ onAuthenticated, onSwitchToRegister }) {
	return (
		<AuthShell leftTitle="Connexion à votre compte">
			<LoginForm onAuthenticated={onAuthenticated} onSwitchToRegister={onSwitchToRegister} />
		</AuthShell>
	);
}
