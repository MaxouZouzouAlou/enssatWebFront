import { createAuthClient } from 'better-auth/react';
import { API_BASE_URL, GOOGLE_AUTH_ENABLED } from './api-config.js';
import { requestJson, requestJsonOrNull } from './http-client.js';

export { API_BASE_URL, GOOGLE_AUTH_ENABLED };

export const authClient = createAuthClient({
	baseURL: `${API_BASE_URL}/api/auth`,
	fetchOptions: {
		credentials: 'include'
	}
});

export async function registerAccount(payload) {
	return requestJson('/api/auth/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload),
		defaultMessage: 'Inscription impossible.'
	});
}

export async function fetchAuthProfile() {
	return requestJsonOrNull('/api/account/profile', {
		nullStatuses: [401],
		defaultMessage: 'Impossible de récupérer le profil.'
	});
}

export async function updatePersonalAddress(payload) {
	return requestJson('/api/account/profile/address', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload),
		defaultMessage: 'Impossible de mettre à jour votre adresse.'
	});
}

export async function updatePersonalProfile(payload) {
	return requestJson('/api/account/profile', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload),
		defaultMessage: 'Impossible de mettre à jour votre profil.'
	});
}

export async function requestEmailChange(payload) {
	return requestJson('/api/account/profile/change-email', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload),
		defaultMessage: "Impossible d'initialiser le changement d'email."
	});
}

export async function deletePersonalAccount() {
	return requestJson('/api/account/profile', {
		method: 'DELETE',
		defaultMessage: 'Impossible de supprimer votre compte.'
	});
}

export async function createProfessionalCompany(payload) {
	return requestJson('/api/account/profile/companies', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload),
		defaultMessage: "Impossible de créer l'entreprise."
	});
}

export async function deleteProfessionalCompany(idEntreprise) {
	return requestJson(`/api/account/profile/companies/${idEntreprise}`, {
		method: 'DELETE',
		defaultMessage: "Impossible de supprimer l'entreprise."
	});
}

export async function requestPasswordReset(email) {
	const redirectTo = `${window.location.origin}/reset-password`;
	return requestJson('/api/auth/request-password-reset', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, redirectTo }),
		defaultMessage: 'Impossible d\'envoyer l\'email de réinitialisation.'
	});
}

export async function resetPassword(token, newPassword) {
	return requestJson('/api/auth/reset-password', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token, newPassword }),
		defaultMessage: 'Impossible de réinitialiser le mot de passe.'
	});
}

export async function resendVerificationEmail(email) {
	return requestJson('/api/auth/send-verification-email', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email,
			callbackURL: `${window.location.origin}/?verified=1`
		}),
		defaultMessage: "Impossible d'envoyer l'email de verification."
	});
}
