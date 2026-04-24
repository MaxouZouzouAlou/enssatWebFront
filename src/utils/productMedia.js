import { API_BASE_URL } from '../services/api-config.js';

export function resolveProductImageUrl(imageValue) {
	if (!imageValue || typeof imageValue !== 'string') return null;
	const trimmed = imageValue.trim();
	if (!trimmed) return null;
	if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
	const base = API_BASE_URL.replace(/\/$/, '');
	const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
	return `${base}${normalizedPath}`;
}

export function getProductImageValue(product) {
	return product?.imagePath ?? product?.image ?? product?.path ?? product?.imageUrl ?? null;
}
