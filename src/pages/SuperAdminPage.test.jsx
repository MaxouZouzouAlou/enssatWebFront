import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SuperAdminPage from './SuperAdminPage.jsx';
import {
	deleteAdminAccount,
	deleteAdminCompany,
	deleteAdminProduct,
	fetchAdminAccounts,
	fetchAdminCompanies,
	fetchAdminOverview,
	fetchAdminProducts,
	updateAdminProductVisibility
} from '../services/superadmin-client.js';

jest.mock('../services/superadmin-client.js', () => ({
	deleteAdminAccount: jest.fn(),
	deleteAdminCompany: jest.fn(),
	deleteAdminProduct: jest.fn(),
	fetchAdminAccounts: jest.fn(),
	fetchAdminCompanies: jest.fn(),
	fetchAdminOverview: jest.fn(),
	fetchAdminProducts: jest.fn(),
	updateAdminProductVisibility: jest.fn(),
}));

beforeEach(() => {
	jest.clearAllMocks();
	window.confirm = jest.fn(() => true);

	fetchAdminOverview.mockResolvedValue({ accounts: 3, companies: 2, products: 4 });
	fetchAdminAccounts.mockResolvedValue([
		{
			id: 'user-1',
			email: 'pro@example.com',
			name: 'Pro Example',
			accountType: 'professionnel',
			companyCount: 2,
			productCount: 4,
		},
	]);
	fetchAdminCompanies.mockResolvedValue([
		{
			id: 9,
			nom: 'Ferme Test',
			siret: '22300100000009',
			adresse_ligne: '1 rue A',
			code_postal: '22300',
			ville: 'Lannion',
			productCount: 4,
			professionalCount: 1,
		},
	]);
	fetchAdminProducts.mockResolvedValue([
		{
			idProduit: 12,
			nom: 'Pommes',
			entrepriseNom: 'Ferme Test',
			professionnelPrenom: 'Jane',
			professionnelNom: 'Doe',
			prix: 2.5,
			stock: 15,
			visible: true,
		},
	]);
	deleteAdminAccount.mockResolvedValue({ deleted: true });
	deleteAdminCompany.mockResolvedValue({ deleted: true });
	deleteAdminProduct.mockResolvedValue({ deleted: true });
	updateAdminProductVisibility.mockResolvedValue({ idProduit: 12, visible: 0 });
});

function renderWithQueryClient(ui) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

test('loads the superadmin dashboard data', async () => {
	renderWithQueryClient(<SuperAdminPage />);

	expect(await screen.findByText('Administration globale')).toBeInTheDocument();
	expect(await screen.findByText('pro@example.com')).toBeInTheDocument();
	expect(screen.getAllByText('Ferme Test')).toHaveLength(2);
	expect(screen.getByText('Pommes')).toBeInTheDocument();
});

test('runs destructive and visibility actions from the superadmin dashboard', async () => {
	renderWithQueryClient(<SuperAdminPage />);

	await screen.findByText('pro@example.com');

	const accountRow = screen.getByText('pro@example.com').closest('tr');
	const companyRow = screen.getAllByText('Ferme Test')[0].closest('tr');
	const productRow = screen.getByText('Pommes').closest('tr');

	fireEvent.click(within(accountRow).getByRole('button', { name: 'Supprimer le compte' }));
	await waitFor(() => expect(deleteAdminAccount).toHaveBeenCalledWith('user-1'));

	fireEvent.click(within(companyRow).getByRole('button', { name: "Supprimer l'entreprise" }));
	await waitFor(() => expect(deleteAdminCompany).toHaveBeenCalledWith(9));

	fireEvent.click(within(productRow).getByRole('button', { name: 'Masquer' }));
	await waitFor(() => expect(updateAdminProductVisibility).toHaveBeenCalledWith(12, false));

	fireEvent.click(within(productRow).getByRole('button', { name: 'Supprimer le produit' }));
	await waitFor(() => expect(deleteAdminProduct).toHaveBeenCalledWith(12));
});
