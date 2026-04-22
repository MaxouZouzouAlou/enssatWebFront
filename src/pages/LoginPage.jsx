import AuthShell from '../features/auth/AuthShell.jsx';
import LoginForm from '../features/auth/LoginForm.jsx';

export default function LoginPage({ onAuthenticated, onSwitchToRegister }) {
	return (
		<AuthShell
			sideContent={
				<div className="space-y-4 text-sm leading-6 text-zinc-700">
					<p>Les sessions sont gerees par cookie securise cote backend.</p>
					<p>Google connecte uniquement des comptes particuliers.</p>
				</div>
			}
		>
			<LoginForm onAuthenticated={onAuthenticated} onSwitchToRegister={onSwitchToRegister} />
		</AuthShell>
	);
}
