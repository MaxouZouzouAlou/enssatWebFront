import { API_BASE_URL } from './auth-client.js';

async function parseResponse(response, defaultMessage) {
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || defaultMessage);
	}
	return data;
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
