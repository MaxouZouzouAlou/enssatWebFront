import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import AccountPage from './AccountPage.jsx';
import {
	authClient,
	createProfessionalCompany,
	deletePersonalAccount,
	deleteProfessionalCompany,
	requestEmailChange,
	updatePersonalProfile
} from '../../services/auth-client.js';
import { ToastProvider } from '../../app/ToastProvider.jsx';

jest.mock('../../services/auth-client.js', () => ({
	authClient: {
		changePassword: jest.fn(),
	},
	createProfessionalCompany: jest.fn(),
	deletePersonalAccount: jest.fn(),
	deleteProfessionalCompany: jest.fn(),
	requestEmailChange: jest.fn(),
	updatePersonalProfile: jest.fn(),
}));

jest.mock('../../features/address/AddressAutocompleteInput.jsx', () => (props) => (
	<input
		aria-label={props.placeholder || 'Adresse'}
		value={props.value}
		onChange={(event) => props.onAddressChange?.(event.target.value)}
	/>
));

function renderAccountPage(overrides = {}) {
	const defaultProps = {
		isProfessional: true,
		profile: {
			accountType: 'professionnel',
			user: {
				nom: 'Doe',
				prenom: 'Jane',
				email: 'jane@example.com',
			},
			professionnel: {
				id: 5,
				entreprise: { id: 11, nom: 'Atelier Test' },
				entreprises: [
					{
						id: 11,
						nom: 'Atelier Test',
						siret: '12345678901234',
						adresse_ligne: '1 rue A',
						code_postal: '22300',
						ville: 'Lannion',
					},
				],
			},
		},
		profileState: { loading: false, error: '', data: null },
		signOut: jest.fn(),
		user: {
			name: 'Jane Doe',
			email: 'jane@example.com',
			emailVerified: true,
		},
		professionalCompanies: [
			{
				id: 11,
				nom: 'Atelier Test',
				siret: '12345678901234',
				adresse_ligne: '1 rue A',
				code_postal: '22300',
				ville: 'Lannion',
			},
		],
		onSelectProfessionalCompany: jest.fn(),
		onProfileRefresh: jest.fn(),
		...overrides,
	};

	return render(
		<ToastProvider>
			<MemoryRouter>
				<AccountPage {...defaultProps} />
			</MemoryRouter>
		</ToastProvider>
	);
}

beforeEach(() => {
	jest.clearAllMocks();
	authClient.changePassword.mockResolvedValue({});
	requestEmailChange.mockResolvedValue({});
	updatePersonalProfile.mockResolvedValue({});
	deletePersonalAccount.mockResolvedValue({});
});

test('creates a professional company from the account page', async () => {
	createProfessionalCompany.mockResolvedValue({ profile: {} });
	const onProfileRefresh = jest.fn().mockResolvedValue();

	renderAccountPage({ onProfileRefresh });

	fireEvent.change(screen.getByLabelText("Nom de l'entreprise"), { target: { value: 'Nouvelle Ferme' } });
	fireEvent.change(screen.getByLabelText('SIRET'), { target: { value: '22300100000009' } });
	fireEvent.change(screen.getByLabelText('12 rue des Producteurs'), { target: { value: '12 rue des Producteurs' } });
	fireEvent.change(screen.getByLabelText('Code postal'), { target: { value: '22300' } });
	fireEvent.change(screen.getByLabelText('Ville'), { target: { value: 'Lannion' } });

	fireEvent.click(screen.getByRole('button', { name: /ajouter une entreprise/i }));

	await waitFor(() => expect(createProfessionalCompany).toHaveBeenCalledWith({
		nom: 'Nouvelle Ferme',
		siret: '22300100000009',
		adresse_ligne: '12 rue des Producteurs',
		code_postal: '22300',
		ville: 'Lannion',
	}));
	expect(onProfileRefresh).toHaveBeenCalled();
});

test('deletes a professional company from the account page after confirmation', async () => {
	deleteProfessionalCompany.mockResolvedValue({ profile: {} });
	const onProfileRefresh = jest.fn().mockResolvedValue();

	renderAccountPage({ onProfileRefresh });

	fireEvent.click(screen.getByRole('button', { name: /supprimer cette entreprise/i }));
	fireEvent.click(screen.getByRole('button', { name: /supprimer l'entreprise/i }));

	await waitFor(() => expect(deleteProfessionalCompany).toHaveBeenCalledWith(11));
	expect(onProfileRefresh).toHaveBeenCalled();
});
