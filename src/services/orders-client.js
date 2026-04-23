import { API_BASE_URL } from './auth-client.js';

async function parseResponse(response, defaultMessage) {
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || defaultMessage);
	}
	return data;
}

export async function fetchCheckoutContext() {
	const response = await fetch(`${API_BASE_URL}/orders/checkout/context`, {
		credentials: 'include'
	});

	return parseResponse(response, 'Impossible de charger le contexte de commande.');
}

export async function previewCheckout(payload = {}) {
	const response = await fetch(`${API_BASE_URL}/orders/checkout/preview`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	return parseResponse(response, 'Impossible de calculer le recapitulatif de commande.');
}

export async function checkoutCurrentCart(payload = {}) {
	const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	return parseResponse(response, 'Impossible de valider la commande.');
}

export async function fetchOrderHistory() {
	const response = await fetch(`${API_BASE_URL}/orders`, {
		credentials: 'include'
	});

	return parseResponse(response, 'Impossible de charger vos commandes.');
}

export async function fetchOrderById(idCommande) {
	const response = await fetch(`${API_BASE_URL}/orders/${idCommande}`, {
		credentials: 'include'
	});

	return parseResponse(response, 'Impossible de charger cette commande.');
}

export async function fetchRecurringOrders() {
	const response = await fetch(`${API_BASE_URL}/orders/recurring`, {
		credentials: 'include'
	});

	return parseResponse(response, 'Impossible de charger vos commandes récurrentes.');
}

export async function createRecurringOrder(payload = {}) {
	const response = await fetch(`${API_BASE_URL}/orders/recurring`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	return parseResponse(response, 'Impossible de créer la commande récurrente.');
}

export async function updateRecurringOrder(idAuto, payload = {}) {
	const response = await fetch(`${API_BASE_URL}/orders/recurring/${idAuto}`, {
		method: 'PATCH',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	return parseResponse(response, 'Impossible de modifier la commande récurrente.');
}

export async function deleteRecurringOrder(idAuto) {
	const response = await fetch(`${API_BASE_URL}/orders/recurring/${idAuto}`, {
		method: 'DELETE',
		credentials: 'include'
	});

	return parseResponse(response, 'Impossible de supprimer la commande récurrente.');
}

export async function runRecurringOrderNow(idAuto) {
	const response = await fetch(`${API_BASE_URL}/orders/recurring/${idAuto}/run`, {
		method: 'POST',
		credentials: 'include'
	});

	return parseResponse(response, 'Impossible de lancer la commande récurrente.');
}
