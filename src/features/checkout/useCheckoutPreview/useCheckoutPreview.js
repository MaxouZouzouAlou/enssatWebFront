import { useEffect, useState } from 'react';
import { previewCheckout } from '../../../services/orders-client/orders-client.js';

export default function useCheckoutPreview({
	payload,
	enabled = true,
	initialPreview = null,
	errorMessage = 'Impossible de recalculer le checkout.'
}) {
	const [preview, setPreview] = useState(initialPreview);
	const [error, setError] = useState('');

	useEffect(() => {
		let ignore = false;

		if (!enabled) {
			setPreview(initialPreview ?? null);
			setError('');
			return () => {
				ignore = true;
			};
		}

		previewCheckout(payload)
			.then((data) => {
				if (ignore) return;
				setPreview(data);
				setError('');
			})
			.catch((previewError) => {
				if (ignore) return;
				setPreview(null);
				setError(previewError.message || errorMessage);
			});

		return () => {
			ignore = true;
		};
	}, [enabled, errorMessage, initialPreview, payload]);

	return {
		preview,
		error
	};
}
