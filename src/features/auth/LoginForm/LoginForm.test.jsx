import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm.jsx';
import { ToastProvider } from '../../../app/ToastProvider.jsx';

const mockSignInEmail = jest.fn();
const mockSignInSocial = jest.fn();
const mockRequestPasswordReset = jest.fn();

jest.mock('../../../services/auth-client', () => ({
	GOOGLE_AUTH_ENABLED: false,
	authClient: {
		signIn: {
			email: (...args) => mockSignInEmail(...args),
			social: (...args) => mockSignInSocial(...args)
		}
	},
	requestPasswordReset: (...args) => mockRequestPasswordReset(...args)
}));

function renderLoginForm(props = {}) {
	return render(
		<ToastProvider>
			<LoginForm onAuthenticated={jest.fn()} onSwitchToRegister={jest.fn()} {...props} />
		</ToastProvider>
	);
}

beforeEach(() => {
	jest.clearAllMocks();
	window.sessionStorage.clear();
	window.history.replaceState({}, '', '/login');
	mockSignInEmail.mockResolvedValue({});
});

test('restores the saved email draft safely', () => {
	window.sessionStorage.setItem('login-draft', JSON.stringify({ email: 'alice@example.com' }));

	renderLoginForm();

	expect(screen.getByLabelText('Email')).toHaveValue('alice@example.com');
});

test('ignores a corrupted login draft instead of crashing', () => {
	window.sessionStorage.setItem('login-draft', '{invalid');

	renderLoginForm();

	expect(screen.getByLabelText('Email')).toHaveValue('');
});

test('shows the verified email success message from the URL search params', () => {
	window.history.replaceState({}, '', '/login?verified=1');

	renderLoginForm();

	expect(screen.getByText('Email vérifié. Vous pouvez vous connecter.')).toBeInTheDocument();
});

test('submits valid credentials and clears the saved draft', async () => {
	const onAuthenticated = jest.fn();
	window.sessionStorage.setItem('login-draft', JSON.stringify({ email: 'alice@example.com' }));

	renderLoginForm({ onAuthenticated });

	fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@example.com' } });
	fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });
	fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

	await waitFor(() => expect(mockSignInEmail).toHaveBeenCalledWith({
		email: 'alice@example.com',
		password: 'password123'
	}));
	expect(window.sessionStorage.getItem('login-draft')).toBeNull();
	expect(onAuthenticated).toHaveBeenCalledTimes(1);
});
