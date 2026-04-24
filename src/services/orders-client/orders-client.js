import { request, requestJson, readResponse } from '../http-client.js';
import { extractFileNameFromDisposition, triggerDownload } from '../../utils/download.js';

export async function fetchCheckoutContext() {
	const response = await request('/orders/checkout/context');

	if (!response.ok) {
		const { data } = await readResponse(response);
		throw new Error(data.error || 'Impossible de charger le contexte de commande.');
	}

	return response.json();
}

export async function previewCheckout(payload = {}) {
	return requestJson('/orders/checkout/preview', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload),
		defaultMessage: 'Impossible de calculer le récapitulatif de commande.'
	});
}

export async function checkoutCurrentCart(payload = {}) {
	return requestJson('/orders/checkout', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload),
		defaultMessage: 'Impossible de valider la commande.'
	});
}

export async function fetchOrderHistory() {
	return requestJson('/orders', {
		defaultMessage: 'Impossible de charger vos commandes.'
	});
}

export async function fetchOrderById(idCommande) {
	return requestJson(`/orders/${idCommande}`, {
		defaultMessage: 'Impossible de charger cette commande.'
	});
}

export async function fetchRecurringOrders() {
	return requestJson('/orders/recurring', {
		defaultMessage: 'Impossible de charger vos commandes récurrentes.'
	});
}

export async function createRecurringOrder(payload = {}) {
	return requestJson('/orders/recurring', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload),
		defaultMessage: 'Impossible de créer la commande récurrente.'
	});
}

export async function updateRecurringOrder(idAuto, payload = {}) {
	return requestJson(`/orders/recurring/${idAuto}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload),
		defaultMessage: 'Impossible de modifier la commande récurrente.'
	});
}

export async function deleteRecurringOrder(idAuto) {
	return requestJson(`/orders/recurring/${idAuto}`, {
		method: 'DELETE',
		defaultMessage: 'Impossible de supprimer la commande récurrente.'
	});
}

export async function runRecurringOrderNow(idAuto) {
	return requestJson(`/orders/recurring/${idAuto}/run`, {
		method: 'POST',
		defaultMessage: 'Impossible de lancer la commande récurrente.'
	});
}

export async function downloadOrderInvoice(idCommande) {
	const response = await request(`/orders/${idCommande}/facture.pdf`);

	if (!response.ok) {
		const { data } = await readResponse(response);
		throw new Error(data.error || 'Impossible de télécharger la facture.');
	}

	const blob = await response.blob();
	const disposition = response.headers.get('Content-Disposition');
	const fileName = extractFileNameFromDisposition(disposition, `facture-commande-${idCommande}.pdf`);
	triggerDownload(blob, fileName);
}
