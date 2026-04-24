import { useSearchParams } from 'react-router';
import AuthShell from '../features/auth/AuthShell.jsx';
import RegisterForm from '../features/auth/RegisterForm/RegisterForm.jsx';

export default function RegisterPage({ onSwitchToLogin }) {
	const [searchParams] = useSearchParams();
	const requestedType = searchParams.get('type');
	const preferredAccountType = requestedType === 'professionnel'
		? 'professionnel'
		: requestedType === 'particulier'
			? 'particulier'
			: null;

	return (
		<AuthShell leftTitle="Création de compte">
			<RegisterForm onSwitchToLogin={onSwitchToLogin} preferredAccountType={preferredAccountType} />
		</AuthShell>
	);
}
