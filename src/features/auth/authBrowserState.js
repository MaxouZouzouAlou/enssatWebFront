export function readSessionJson(key, fallback) {
	if (typeof window === 'undefined') return fallback;

	try {
		const raw = window.sessionStorage.getItem(key);
		if (!raw) return fallback;

		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === 'object' ? parsed : fallback;
	} catch {
		return fallback;
	}
}

export function readSearchParam(search, key) {
	if (!search) return null;

	try {
		return new URLSearchParams(search).get(key);
	} catch {
		return null;
	}
}
