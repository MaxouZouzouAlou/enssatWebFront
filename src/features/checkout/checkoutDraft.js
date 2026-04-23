const STORAGE_KEY = 'localzh_checkout_draft';

export function loadCheckoutDraft() {
	try {
		const raw = window.sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch {
		return {};
	}
}

export function saveCheckoutDraft(partialDraft) {
	const nextDraft = {
		...loadCheckoutDraft(),
		...partialDraft
	};

	window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
	return nextDraft;
}

export function clearCheckoutDraft() {
	window.sessionStorage.removeItem(STORAGE_KEY);
}
