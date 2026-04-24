import { API_BASE_URL } from './auth-client';

async function readJsonResponse(response, fallbackMessage) {
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || fallbackMessage);
	}
	return data;
}

export async function fetchIncidents() {
	const response = await fetch(`${API_BASE_URL}/incidents`, {
		credentials: 'include',
		headers: {
			Accept: 'application/json'
		}
	});

	return readJsonResponse(response, 'Impossible de charger les incidents.');
}

export async function fetchIncident(ticketId) {
	const response = await fetch(`${API_BASE_URL}/incidents/${ticketId}`, {
		credentials: 'include',
		headers: {
			Accept: 'application/json'
		}
	});

	return readJsonResponse(response, 'Impossible de charger le ticket.');
}

export async function createIncident(payload) {
	const response = await fetch(`${API_BASE_URL}/incidents`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	return readJsonResponse(response, 'Création du ticket impossible pour le moment.');
}

export async function replyToIncident(ticketId, message) {
	const response = await fetch(`${API_BASE_URL}/incidents/${ticketId}/reponses`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ message })
	});

	return readJsonResponse(response, 'Réponse impossible pour le moment.');
}

export async function updateIncidentStatus(ticketId, status, commentaire = '') {
	const response = await fetch(`${API_BASE_URL}/incidents/${ticketId}/status`, {
		method: 'PATCH',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ status, commentaire })
	});

	return readJsonResponse(response, 'Mise à jour du statut impossible pour le moment.');
}
