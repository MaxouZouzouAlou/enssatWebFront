import { renderHook, waitFor } from '@testing-library/react';
import useCheckoutPreview from './useCheckoutPreview';

jest.mock('../../../services/orders-client/orders-client.js', () => ({
	previewCheckout: jest.fn()
}));

const { previewCheckout } = jest.requireMock('../../../services/orders-client/orders-client.js');

beforeEach(() => {
	jest.clearAllMocks();
});

test('loads preview data when enabled', async () => {
	previewCheckout.mockResolvedValue({ totalTtc: 42 });

	const { result } = renderHook(() => useCheckoutPreview({
		payload: { modeLivraison: 'point_relais' },
		enabled: true
	}));

	await waitFor(() => expect(result.current.preview).toEqual({ totalTtc: 42 }));
	expect(result.current.error).toBe('');
});

test('does not call preview endpoint when disabled', () => {
	const { result } = renderHook(() => useCheckoutPreview({
		payload: { modeLivraison: 'point_relais' },
		enabled: false,
		initialPreview: { totalTtc: 15 }
	}));

	expect(previewCheckout).not.toHaveBeenCalled();
	expect(result.current.preview).toEqual({ totalTtc: 15 });
	expect(result.current.error).toBe('');
});

test('surfaces a readable preview error', async () => {
	previewCheckout.mockRejectedValue(new Error('Preview indisponible'));

	const { result } = renderHook(() => useCheckoutPreview({
		payload: { modeLivraison: 'domicile' },
		enabled: true,
		errorMessage: 'Impossible de calculer le recapitulatif.'
	}));

	await waitFor(() => expect(result.current.error).toBe('Preview indisponible'));
	expect(result.current.preview).toBeNull();
});
