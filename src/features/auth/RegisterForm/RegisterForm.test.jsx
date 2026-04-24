import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RegisterForm from './RegisterForm.jsx';
import { registerAccount } from '../../../services/auth-client';
import { ToastProvider } from '../../../app/ToastProvider.jsx';

jest.mock('../../../services/auth-client', () => ({
	authClient: {
		signIn: {
			social: jest.fn()
		}
	},
	registerAccount: jest.fn()
}));

beforeEach(() => {
	registerAccount.mockReset();
	window.sessionStorage.clear();
});

function renderRegisterForm(props = {}) {
	return render(
		<ToastProvider>
			<RegisterForm onSwitchToLogin={jest.fn()} {...props} />
		</ToastProvider>
	);
}

test('shows application validation errors for missing passwords', () => {
	renderRegisterForm();

	fireEvent.click(screen.getByRole('button', { name: /^créer le compte$/i }));

	expect(screen.getByText('Mot de passe requis.')).toBeInTheDocument();
	expect(screen.getByText('Confirmation requise.')).toBeInTheDocument();
	expect(screen.getAllByText('Corrigez les champs indiques.')).toHaveLength(2);
	expect(registerAccount).not.toHaveBeenCalled();
});

test('submits a normalized registration payload', async () => {
	registerAccount.mockResolvedValueOnce({});
	renderRegisterForm();

	fireEvent.change(screen.getByLabelText('Prenom'), { target: { value: '  Alice  ' } });
	fireEvent.change(screen.getByLabelText('Nom'), { target: { value: '  Martin  ' } });
	fireEvent.change(screen.getByLabelText('Email'), { target: { value: '  ALICE@example.COM  ' } });
	fireEvent.change(screen.getByLabelText(/mot de passe/i, { selector: 'input' }), { target: { value: 'password123' } });
	fireEvent.change(screen.getByLabelText(/confirmation/i, { selector: 'input' }), { target: { value: 'password123' } });
	fireEvent.click(screen.getByRole('button', { name: /^créer le compte$/i }));

	await waitFor(() => expect(registerAccount).toHaveBeenCalledTimes(1));
	expect(registerAccount).toHaveBeenCalledWith({
		accountType: 'particulier',
		email: 'alice@example.com',
		nom: 'Martin',
		prenom: 'Alice',
		password: 'password123',
		entreprise: undefined
	});
});

test('uses the explicit professional mode when requested', () => {
	renderRegisterForm({ preferredAccountType: 'professionnel' });

	expect(screen.getByRole('button', { name: 'Professionnel' })).toHaveClass('bg-primary-500');
	expect(screen.getByLabelText("Nom de l'entreprise")).toBeInTheDocument();
});

test('restores the verification step from session storage', () => {
	window.sessionStorage.setItem('register-verification-email', 'alice@example.com');

	renderRegisterForm();

	expect(screen.getByRole('heading', { name: /v.rifiez votre email/i })).toBeInTheDocument();
	expect(screen.getByText(/alice@example\.com/i)).toBeInTheDocument();
});

test('clears the stored verification state when returning to login', () => {
	const onSwitchToLogin = jest.fn();
	window.sessionStorage.setItem('register-verification-email', 'alice@example.com');

	renderRegisterForm({ onSwitchToLogin });

	fireEvent.click(screen.getByRole('button', { name: /retour . la connexion/i }));

	expect(window.sessionStorage.getItem('register-verification-email')).toBeNull();
	expect(onSwitchToLogin).toHaveBeenCalledTimes(1);
});

test('ignores a corrupted register draft instead of crashing', () => {
	window.sessionStorage.setItem('register-draft', '{invalid');

	renderRegisterForm();

	expect(screen.getByRole('button', { name: 'Particulier' })).toHaveClass('bg-primary-500');
	expect(screen.getByLabelText('Prenom')).toHaveValue('');
});
