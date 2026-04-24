import { API_BASE_URL } from './auth-client.js';

const CHECKOUT_CONTEXT_TTL_MS = 30_000;
let checkoutContextCache = {
	data: null,
	promise: null,
	expiresAt: 0
};

async function parseResponse(response, defaultMessage) {
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || defaultMessage);
	}
	return data;
}

export async function fetchCheckoutContext() {
	if (checkoutContextCache.data && checkoutContextCache.expiresAt > Date.now()) {
		return checkoutContextCache.data;
	}

	if (checkoutContextCache.promise) {
		return checkoutContextCache.promise;
	}

	checkoutContextCache.promise = fetch(`${API_BASE_URL}/orders/checkout/context`, {
		credentials: 'include'
	})
		.then((response) => parseResponse(response, 'Impossible de charger le contexte de commande.'))
		.then((data) => {
			checkoutContextCache = {
				data,
				promise: null,
				expiresAt: Date.now() + CHECKOUT_CONTEXT_TTL_MS
			};
			return data;
		})
		.catch((error) => {
			checkoutContextCache = {
				data: null,
				promise: null,
				expiresAt: 0
			};
			throw error;
		});

	return checkoutContextCache.promise;
}

export function getCachedCheckoutContext() {
	if (!checkoutContextCache.data || checkoutContextCache.expiresAt <= Date.now()) {
		return null;
	}

	return checkoutContextCache.data;
}

export function clearCheckoutContextCache() {
	checkoutContextCache = {
		data: null,
		promise: null,
		expiresAt: 0
	};
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

	return parseResponse(response, 'Impossible de calculer le récapitulatif de commande.');
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

function triggerDownload(blob, fileName) {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}

function extractFileNameFromDisposition(contentDisposition, fallbackName) {
	if (!contentDisposition) return fallbackName;

	const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
	if (utf8Match?.[1]) {
		try {
			return decodeURIComponent(utf8Match[1]);
		} catch {
			return utf8Match[1];
		}
	}

	const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
	if (asciiMatch?.[1]) {
		return asciiMatch[1];
	}

	return fallbackName;
}

export async function downloadOrderInvoice(idCommande) {
	const response = await fetch(`${API_BASE_URL}/orders/${idCommande}/facture.pdf`, {
		credentials: 'include'
	});

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.error || 'Impossible de télécharger la facture.');
	}

	const blob = await response.blob();
	const disposition = response.headers.get('Content-Disposition');
	const fileName = extractFileNameFromDisposition(disposition, `facture-commande-${idCommande}.pdf`);
	triggerDownload(blob, fileName);
}
