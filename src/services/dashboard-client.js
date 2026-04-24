import { API_BASE_URL } from './api-config.js';
import { request, requestJson, readResponse } from './http-client.js';
import { extractFileNameFromDisposition, triggerDownload } from '../utils/download.js';

function withCompanyScope(url, idEntreprise) {
	if (idEntreprise == null) return url;
	const scopedUrl = new URL(url, window.location.origin);
	scopedUrl.searchParams.set('idEntreprise', String(idEntreprise));
	return scopedUrl.toString();
}

export async function fetchProfessionalDashboard(idProfessionnel, idEntreprise = null) {
	return requestJson(withCompanyScope(`${API_BASE_URL}/professionnels/${idProfessionnel}/dashboard`, idEntreprise), {
		defaultMessage: 'Impossible de récupérer le dashboard professionnel.'
	});
}

export async function downloadProfessionalSalesReport(idProfessionnel, days = 90, idEntreprise = null) {
	const scopedUrl = new URL(`${API_BASE_URL}/professionnels/${idProfessionnel}/documents/ventes.csv`, window.location.origin);
	scopedUrl.searchParams.set('days', String(days));
	if (idEntreprise != null) {
		scopedUrl.searchParams.set('idEntreprise', String(idEntreprise));
	}
	const response = await request(scopedUrl.toString());

	if (!response.ok) {
		const { data } = await readResponse(response);
		throw new Error(data.error || 'Impossible de télécharger le rapport de ventes.');
	}

	const blob = await response.blob();
	const disposition = response.headers.get('Content-Disposition');
	const fileName = extractFileNameFromDisposition(disposition, `rapport-ventes-pro-${idProfessionnel}-${days}j.csv`);
	triggerDownload(blob, fileName);
}

export async function downloadOrderInvoice(idProfessionnel, idCommande, idEntreprise = null) {
	const response = await request(
		withCompanyScope(`${API_BASE_URL}/professionnels/${idProfessionnel}/documents/commande/${idCommande}/facture.pdf`, idEntreprise),
	);

	if (!response.ok) {
		const { data } = await readResponse(response);
		throw new Error(data.error || 'Impossible de télécharger la facture.');
	}

	const blob = await response.blob();
	const disposition = response.headers.get('Content-Disposition');
	const fileName = extractFileNameFromDisposition(disposition, `facture-commande-${idCommande}-pro-${idProfessionnel}.pdf`);
	triggerDownload(blob, fileName);
}
