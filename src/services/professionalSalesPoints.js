import { requestJson } from './http-client.js';

export async function fetchCompanySalesPoints(idProfessionnel, idEntreprise) {
	return requestJson(`/professionnels/${idProfessionnel}/entreprises/${idEntreprise}/lieux-vente`, {
		defaultMessage: 'Impossible de charger les points de vente.'
	});
}

export async function attachCompanySalesPoint(idProfessionnel, idEntreprise, idLieu) {
	return requestJson(`/professionnels/${idProfessionnel}/entreprises/${idEntreprise}/lieux-vente/attach`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ idLieu }),
		defaultMessage: 'Impossible de rattacher ce point de vente.'
	});
}

export async function createCompanySalesPoint(idProfessionnel, idEntreprise, payload) {
	return requestJson(`/professionnels/${idProfessionnel}/entreprises/${idEntreprise}/lieux-vente`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload),
		defaultMessage: 'Impossible de créer ce point de vente.'
	});
}

export async function detachCompanySalesPoint(idProfessionnel, idEntreprise, idLieu) {
	return requestJson(`/professionnels/${idProfessionnel}/entreprises/${idEntreprise}/lieux-vente/${idLieu}`, {
		method: 'DELETE',
		defaultMessage: 'Impossible de détacher ce point de vente.'
	});
}
