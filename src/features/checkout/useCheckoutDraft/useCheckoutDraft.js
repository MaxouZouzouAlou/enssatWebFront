import { useMemo } from 'react';
import { clearCheckoutDraft, loadCheckoutDraft, saveCheckoutDraft } from '../checkoutDraft.js';

export default function useCheckoutDraft() {
	const draft = useMemo(() => loadCheckoutDraft(), []);

	return {
		draft,
		saveDraft: saveCheckoutDraft,
		clearDraft: clearCheckoutDraft
	};
}
