import { API_BASE_URL } from './auth-client.js';

async function parseResponse(response, defaultMessage) {
	const data = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(data.error || defaultMessage);
	return data;
}

export async function fetchNotifications() {
	const response = await fetch(`${API_BASE_URL}/notifications`, { credentials: 'include' });
	return parseResponse(response, 'Impossible de charger les notifications.');
}

export async function markNotificationRead(id) {
	const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
		method: 'PATCH',
		credentials: 'include',
	});
	return parseResponse(response, 'Impossible de marquer la notification comme lue.');
}

export async function markAllNotificationsRead() {
	const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
		method: 'PATCH',
		credentials: 'include',
	});
	return parseResponse(response, 'Impossible de marquer les notifications comme lues.');
}

export async function deleteNotification(id) {
	const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
		method: 'DELETE',
		credentials: 'include',
	});
	return parseResponse(response, 'Impossible de supprimer la notification.');
}
