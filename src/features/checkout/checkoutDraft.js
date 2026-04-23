const STORAGE_KEY = 'localzh_checkout_draft';
const DEFAULT_PAYMENT_MODE = 'carte_bancaire';
const ALLOWED_PAYMENT_MODES = new Set(['carte_bancaire', 'paypal', 'apple_pay']);

function normalizeCheckoutDraft(draft) {
	if (!draft || typeof draft !== 'object') return {};
	const normalizedPaymentMode = ALLOWED_PAYMENT_MODES.has(draft.modePaiement)
		? draft.modePaiement
		: DEFAULT_PAYMENT_MODE;
	const adresseLivraison = draft.adresseLivraison && typeof draft.adresseLivraison === 'object'
		? {
			adresse_ligne: String(draft.adresseLivraison.adresse_ligne || '').trim(),
			code_postal: String(draft.adresseLivraison.code_postal || '').trim(),
			ville: String(draft.adresseLivraison.ville || '').trim()
		}
		: null;
	const voucherId = draft.voucherId == null || draft.voucherId === ''
		? null
		: Number.isInteger(Number(draft.voucherId)) && Number(draft.voucherId) > 0
			? Number(draft.voucherId)
			: null;

	return {
		...draft,
		modePaiement: normalizedPaymentMode,
		adresseLivraison,
		voucherId
	};
}

export function loadCheckoutDraft() {
	try {
		const raw = window.sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return normalizeCheckoutDraft(parsed);
	} catch {
		return {};
	}
}

export function saveCheckoutDraft(partialDraft) {
	const nextDraft = normalizeCheckoutDraft({
		...loadCheckoutDraft(),
		...partialDraft
	});

	window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
	return nextDraft;
}

export function clearCheckoutDraft() {
	window.sessionStorage.removeItem(STORAGE_KEY);
}
