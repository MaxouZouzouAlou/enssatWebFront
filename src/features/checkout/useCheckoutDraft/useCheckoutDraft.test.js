import { renderHook } from '@testing-library/react';
import useCheckoutDraft from './useCheckoutDraft';

jest.mock('../checkoutDraft.js', () => ({
	clearCheckoutDraft: jest.fn(),
	loadCheckoutDraft: jest.fn(),
	saveCheckoutDraft: jest.fn()
}));

const {
	clearCheckoutDraft,
	loadCheckoutDraft,
	saveCheckoutDraft
} = jest.requireMock('../checkoutDraft.js');

beforeEach(() => {
	jest.clearAllMocks();
});

test('exposes the loaded checkout draft and draft actions', () => {
	loadCheckoutDraft.mockReturnValue({ modeLivraison: 'point_relais' });

	const { result } = renderHook(() => useCheckoutDraft());

	expect(result.current.draft).toEqual({ modeLivraison: 'point_relais' });
	expect(result.current.saveDraft).toBe(saveCheckoutDraft);
	expect(result.current.clearDraft).toBe(clearCheckoutDraft);
});
