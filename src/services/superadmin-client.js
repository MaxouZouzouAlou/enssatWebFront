import { API_BASE_URL } from './auth-client.js';

async function parseAdminResponse(response, defaultMessage) {
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || defaultMessage);
	}
	return data;
}

export async function fetchAdminOverview() {
	const response = await fetch(`${API_BASE_URL}/superadmin/overview`, {
		credentials: 'include',
	});
	return parseAdminResponse(response, "Impossible de charger la vue d'ensemble superadmin.");
}

export async function fetchAdminAccounts() {
	const response = await fetch(`${API_BASE_URL}/superadmin/accounts`, {
		credentials: 'include',
	});
	return parseAdminResponse(response, 'Impossible de charger les comptes.');
}

export async function deleteAdminAccount(authUserId) {
	const response = await fetch(`${API_BASE_URL}/superadmin/accounts/${authUserId}`, {
		method: 'DELETE',
		credentials: 'include',
	});
	return parseAdminResponse(response, 'Impossible de supprimer ce compte.');
}

export async function fetchAdminCompanies() {
	const response = await fetch(`${API_BASE_URL}/superadmin/companies`, {
		credentials: 'include',
	});
	return parseAdminResponse(response, 'Impossible de charger les entreprises.');
}

export async function deleteAdminCompany(idEntreprise) {
	const response = await fetch(`${API_BASE_URL}/superadmin/companies/${idEntreprise}`, {
		method: 'DELETE',
		credentials: 'include',
	});
	return parseAdminResponse(response, "Impossible de supprimer cette entreprise.");
}

export async function fetchAdminProducts() {
	const response = await fetch(`${API_BASE_URL}/superadmin/products`, {
		credentials: 'include',
	});
	return parseAdminResponse(response, 'Impossible de charger les produits.');
}

export async function updateAdminProductVisibility(idProduit, visible) {
	const response = await fetch(`${API_BASE_URL}/superadmin/products/${idProduit}/visibility`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({ visible })
	});
	return parseAdminResponse(response, 'Impossible de mettre a jour la visibilite du produit.');
}

export async function deleteAdminProduct(idProduit) {
	const response = await fetch(`${API_BASE_URL}/superadmin/products/${idProduit}`, {
		method: 'DELETE',
		credentials: 'include',
	});
	return parseAdminResponse(response, 'Impossible de supprimer ce produit.');
}
