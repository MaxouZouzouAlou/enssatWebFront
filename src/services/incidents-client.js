import { requestJson } from './http-client.js';

export async function fetchIncidents() {
	return requestJson('/incidents', {
		headers: {
			Accept: 'application/json'
		},
		defaultMessage: 'Impossible de charger les incidents.'
	});
}

export async function fetchIncident(ticketId) {
	return requestJson(`/incidents/${ticketId}`, {
		headers: {
			Accept: 'application/json'
		},
		defaultMessage: 'Impossible de charger le ticket.'
	});
}

export async function createIncident(payload) {
	return requestJson('/incidents', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload),
		defaultMessage: 'Creation du ticket impossible pour le moment.'
	});
}

export async function replyToIncident(ticketId, message) {
	return requestJson(`/incidents/${ticketId}/reponses`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ message }),
		defaultMessage: 'Reponse impossible pour le moment.'
	});
}

export async function updateIncidentStatus(ticketId, status, commentaire = '') {
	return requestJson(`/incidents/${ticketId}/status`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ status, commentaire }),
		defaultMessage: 'Mise a jour du statut impossible pour le moment.'
	});
}
