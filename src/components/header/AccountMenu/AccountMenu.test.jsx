import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import AccountMenu from './AccountMenu.jsx';

function renderAccountMenu(props = {}) {
	return render(
		<MemoryRouter>
			<AccountMenu
				isAuthenticated
				isProfessional={false}
				onClose={jest.fn()}
				onSignOut={jest.fn()}
				{...props}
			/>
		</MemoryRouter>
	);
}

test('shows loyalty entry for non professional accounts', () => {
	renderAccountMenu();

	expect(screen.getByRole('button', { name: /ma fidélité/i })).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: /espace pro/i })).not.toBeInTheDocument();
});

test('hides loyalty entry for professional accounts', () => {
	renderAccountMenu({ isProfessional: true });

	expect(screen.queryByRole('button', { name: /ma fidélité/i })).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: /espace pro/i })).toBeInTheDocument();
});

test('shows administration entry and hides user-only entries for superadmin accounts', () => {
	renderAccountMenu({ isSuperAdmin: true });

	expect(screen.getByRole('button', { name: /administration/i })).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: /mes commandes/i })).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: /ma fidélité/i })).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: /espace pro/i })).not.toBeInTheDocument();
});
