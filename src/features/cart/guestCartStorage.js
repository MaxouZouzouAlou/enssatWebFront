import { EMPTY_CART } from './cartItems';

export const GUEST_CART_STORAGE_KEY = 'localzh-guest-cart';

export function readGuestCartStorage(fallback = EMPTY_CART) {
	if (typeof window === 'undefined') return fallback;

	try {
		const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
		if (!raw) return fallback;

		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : fallback;
	} catch {
		return fallback;
	}
}

export function writeGuestCartStorage(items) {
	if (typeof window === 'undefined') return;

	try {
		if (!items?.length) {
			window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
			return;
		}

		window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
	} catch {
		// Ignore storage quota or serialization failures.
	}
}

export function clearGuestCartStorage() {
	if (typeof window === 'undefined') return;

	try {
		window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
	} catch {
		// Ignore storage failures.
	}
}
