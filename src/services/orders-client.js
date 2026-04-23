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
