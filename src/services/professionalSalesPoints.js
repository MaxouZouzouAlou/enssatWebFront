import { API_BASE_URL } from './auth-client.js';

async function parseJsonResponse(response, fallbackMessage) {
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || fallbackMessage);
	}
	return data;
}

export async function fetchCompanySalesPoints(idProfessionnel, idEntreprise) {
	const response = await fetch(
		`${API_BASE_URL}/professionnels/${idProfessionnel}/entreprises/${idEntreprise}/lieux-vente`,
		{
			credentials: 'include'
		}
	);

	return parseJsonResponse(response, 'Impossible de charger les points de vente.');
}

export async function attachCompanySalesPoint(idProfessionnel, idEntreprise, idLieu) {
	const response = await fetch(
		`${API_BASE_URL}/professionnels/${idProfessionnel}/entreprises/${idEntreprise}/lieux-vente/attach`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ idLieu })
		}
	);

	return parseJsonResponse(response, 'Impossible de rattacher ce point de vente.');
}

export async function createCompanySalesPoint(idProfessionnel, idEntreprise, payload) {
	const response = await fetch(
		`${API_BASE_URL}/professionnels/${idProfessionnel}/entreprises/${idEntreprise}/lieux-vente`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify(payload)
		}
	);

	return parseJsonResponse(response, 'Impossible de creer ce point de vente.');
}

export async function detachCompanySalesPoint(idProfessionnel, idEntreprise, idLieu) {
	const response = await fetch(
		`${API_BASE_URL}/professionnels/${idProfessionnel}/entreprises/${idEntreprise}/lieux-vente/${idLieu}`,
		{
			method: 'DELETE',
			credentials: 'include'
		}
	);

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.error || 'Impossible de detacher ce point de vente.');
	}
}
