import { requestJson } from './http-client.js';

export async function fetchNotifications() {
	return requestJson('/notifications', { defaultMessage: 'Impossible de charger les notifications.' });
}

export async function markNotificationRead(id) {
	return requestJson(`/notifications/${id}/read`, {
		method: 'PATCH',
		defaultMessage: 'Impossible de marquer la notification comme lue.'
	});
}

export async function markAllNotificationsRead() {
	return requestJson('/notifications/read-all', {
		method: 'PATCH',
		defaultMessage: 'Impossible de marquer les notifications comme lues.'
	});
}

export async function deleteNotification(id) {
	return requestJson(`/notifications/${id}`, {
		method: 'DELETE',
		defaultMessage: 'Impossible de supprimer la notification.'
	});
}
