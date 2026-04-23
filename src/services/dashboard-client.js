import { API_BASE_URL } from './auth-client';

export async function fetchProfessionalDashboard(idProfessionnel) {
	const response = await fetch(`${API_BASE_URL}/professionnels/${idProfessionnel}/dashboard`, {
		credentials: 'include'
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || 'Impossible de recuperer le dashboard professionnel.');
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

export async function downloadProfessionalSalesReport(idProfessionnel, days = 90) {
	const response = await fetch(`${API_BASE_URL}/professionnels/${idProfessionnel}/documents/ventes.csv?days=${days}`, {
		credentials: 'include'
	});

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.error || 'Impossible de telecharger le rapport de ventes.');
	}

	const blob = await response.blob();
	const disposition = response.headers.get('Content-Disposition');
	const fileName = extractFileNameFromDisposition(disposition, `rapport-ventes-pro-${idProfessionnel}-${days}j.csv`);
	triggerDownload(blob, fileName);
}

export async function downloadOrderInvoice(idProfessionnel, idCommande) {
	const response = await fetch(`${API_BASE_URL}/professionnels/${idProfessionnel}/documents/commande/${idCommande}/facture.pdf`, {
		credentials: 'include'
	});

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.error || 'Impossible de telecharger la facture.');
	}

	const blob = await response.blob();
	const disposition = response.headers.get('Content-Disposition');
	const fileName = extractFileNameFromDisposition(disposition, `facture-commande-${idCommande}-pro-${idProfessionnel}.pdf`);
	triggerDownload(blob, fileName);
}
