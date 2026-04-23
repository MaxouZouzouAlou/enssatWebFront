import { createAuthClient } from 'better-auth/react';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:49161';
export const GOOGLE_AUTH_ENABLED = process.env.REACT_APP_ENABLE_GOOGLE_AUTH === 'true';

export const authClient = createAuthClient({
	baseURL: `${API_BASE_URL}/api/auth`,
	fetchOptions: {
		credentials: 'include'
	}
});

export async function registerAccount(payload) {
	const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || 'Inscription impossible.');
	}
	return data;
}

export async function fetchAuthProfile() {
	const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
		credentials: 'include'
	});

	if (response.status === 401) return null;

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || 'Impossible de recuperer le profil.');
	}
	return data;
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
