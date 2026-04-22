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
