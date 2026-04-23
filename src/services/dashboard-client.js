import { API_BASE_URL } from './auth-client';

function withCompanyScope(url, idEntreprise) {
	if (idEntreprise == null) return url;
	const scopedUrl = new URL(url, window.location.origin);
	scopedUrl.searchParams.set('idEntreprise', String(idEntreprise));
	return scopedUrl.toString();
}

export async function fetchProfessionalDashboard(idProfessionnel, idEntreprise = null) {
	const response = await fetch(withCompanyScope(`${API_BASE_URL}/professionnels/${idProfessionnel}/dashboard`, idEntreprise), {
		credentials: 'include'
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || 'Impossible de récupérer le dashboard professionnel.');
	}
	return data;
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

export async function downloadProfessionalSalesReport(idProfessionnel, days = 90, idEntreprise = null) {
	const scopedUrl = new URL(`${API_BASE_URL}/professionnels/${idProfessionnel}/documents/ventes.csv`, window.location.origin);
	scopedUrl.searchParams.set('days', String(days));
	if (idEntreprise != null) {
		scopedUrl.searchParams.set('idEntreprise', String(idEntreprise));
	}
	const response = await fetch(scopedUrl.toString(), {
		credentials: 'include'
	});

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.error || 'Impossible de télécharger le rapport de ventes.');
	}

	const blob = await response.blob();
	const disposition = response.headers.get('Content-Disposition');
	const fileName = extractFileNameFromDisposition(disposition, `rapport-ventes-pro-${idProfessionnel}-${days}j.csv`);
	triggerDownload(blob, fileName);
}

export async function downloadOrderInvoice(idProfessionnel, idCommande, idEntreprise = null) {
	const response = await fetch(
		withCompanyScope(`${API_BASE_URL}/professionnels/${idProfessionnel}/documents/commande/${idCommande}/facture.pdf`, idEntreprise),
		{
		credentials: 'include'
		}
	);

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.error || 'Impossible de télécharger la facture.');
	}

	const blob = await response.blob();
	const disposition = response.headers.get('Content-Disposition');
	const fileName = extractFileNameFromDisposition(disposition, `facture-commande-${idCommande}-pro-${idProfessionnel}.pdf`);
	triggerDownload(blob, fileName);
}
