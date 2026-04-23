import { createAuthClient } from 'better-auth/react';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:49161';
export const GOOGLE_AUTH_ENABLED = process.env.REACT_APP_ENABLE_GOOGLE_AUTH === 'true';

export const authClient = createAuthClient({
	baseURL: `${API_BASE_URL}/api/auth`,
	fetchOptions: {
		credentials: 'include'
	}
});

async function parseJsonResponse(response, defaultMessage) {
	const text = await response.text();
	let data = {};
	try {
		data = text ? JSON.parse(text) : {};
	} catch {
		data = {};
	}

	if (!response.ok) {
		throw new Error(data.error || data.message || text || defaultMessage);
	}

	return data;
}

export async function registerAccount(payload) {
	const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	return parseJsonResponse(response, 'Inscription impossible.');
}

export async function fetchAuthProfile() {
	const response = await fetch(`${API_BASE_URL}/api/account/profile`, {
		credentials: 'include'
	});

	if (response.status === 401) return null;
	return parseJsonResponse(response, 'Impossible de recuperer le profil.');
}

export async function updatePersonalAddress(payload) {
	const response = await fetch(`${API_BASE_URL}/api/account/profile/address`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	return parseJsonResponse(response, 'Impossible de mettre a jour votre adresse.');
}

export async function updatePersonalProfile(payload) {
	const response = await fetch(`${API_BASE_URL}/api/account/profile`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	return parseJsonResponse(response, 'Impossible de mettre a jour votre profil.');
}

export async function requestEmailChange(payload) {
	const response = await fetch(`${API_BASE_URL}/api/account/profile/change-email`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	return parseJsonResponse(response, "Impossible d'initialiser le changement d'email.");
}

export async function deletePersonalAccount() {
	const response = await fetch(`${API_BASE_URL}/api/account/profile`, {
		method: 'DELETE',
		credentials: 'include'
	});

	return parseJsonResponse(response, 'Impossible de supprimer votre compte.');
}

export async function requestPasswordReset(email) {
	const redirectTo = `${window.location.origin}/reset-password`;
	const response = await fetch(`${API_BASE_URL}/api/auth/request-password-reset`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ email, redirectTo })
	});
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.message || data.error || 'Impossible d\'envoyer l\'email de réinitialisation.');
	}
	return data;
}

export async function resetPassword(token, newPassword) {
	const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ token, newPassword })
	});
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.message || data.error || 'Impossible de réinitialiser le mot de passe.');
	}
	return data;
}

export async function resendVerificationEmail(email) {
	const response = await fetch(`${API_BASE_URL}/api/auth/send-verification-email`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({
			email,
			callbackURL: `${window.location.origin}/?verified=1`
		})
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.message || data.error || "Impossible d'envoyer l'email de verification.");
	}
	return data;
}
