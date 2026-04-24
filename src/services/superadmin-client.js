import { requestJson } from './http-client.js';

export async function fetchAdminOverview() {
	return requestJson('/superadmin/overview', {
		defaultMessage: "Impossible de charger la vue d'ensemble superadmin."
	});
}

export async function fetchAdminAccounts() {
	return requestJson('/superadmin/accounts', {
		defaultMessage: 'Impossible de charger les comptes.'
	});
}

export async function deleteAdminAccount(authUserId) {
	return requestJson(`/superadmin/accounts/${authUserId}`, {
		method: 'DELETE',
		defaultMessage: 'Impossible de supprimer ce compte.'
	});
}

export async function fetchAdminCompanies() {
	return requestJson('/superadmin/companies', {
		defaultMessage: 'Impossible de charger les entreprises.'
	});
}

export async function deleteAdminCompany(idEntreprise) {
	return requestJson(`/superadmin/companies/${idEntreprise}`, {
		method: 'DELETE',
		defaultMessage: "Impossible de supprimer cette entreprise."
	});
}

export async function fetchAdminProducts() {
	return requestJson('/superadmin/products', {
		defaultMessage: 'Impossible de charger les produits.'
	});
}

export async function updateAdminProductVisibility(idProduit, visible) {
	return requestJson(`/superadmin/products/${idProduit}/visibility`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ visible }),
		defaultMessage: 'Impossible de mettre a jour la visibilite du produit.'
	});
}

export async function deleteAdminProduct(idProduit) {
	return requestJson(`/superadmin/products/${idProduit}`, {
		method: 'DELETE',
		defaultMessage: 'Impossible de supprimer ce produit.'
	});
}
