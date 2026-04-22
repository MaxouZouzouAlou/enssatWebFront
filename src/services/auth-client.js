import { createAuthClient } from 'better-auth/react';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:49161';

export const authClient = createAuthClient({
	baseURL: API_BASE_URL,
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
