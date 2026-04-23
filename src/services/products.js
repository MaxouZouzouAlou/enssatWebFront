import { API_BASE_URL } from './auth-client.js';

function appendIfPresent(params, key, value) {
	if (value == null || value === '') return;
	params.set(key, String(value));
}

async function getListProducts({
	page = 1,
	limit = 9,
	q = '',
	natures = [],
	bio = null,
	enStock = null,
	prixMin = null,
	prixMax = null,
	sort = 'alpha_asc'
} = {}) {
	const params = new URLSearchParams();
	params.set('page', String(page));
	params.set('limit', String(limit));
	appendIfPresent(params, 'q', String(q || '').trim());
	if (Array.isArray(natures) && natures.length) {
		params.set('nature', natures.join(','));
	}
	if (bio !== null) {
		params.set('bio', String(Boolean(bio)));
	}
	if (enStock !== null) {
		params.set('enStock', String(Boolean(enStock)));
	}
	appendIfPresent(params, 'prixMin', prixMin);
	appendIfPresent(params, 'prixMax', prixMax);
	appendIfPresent(params, 'sort', sort);

	const response = await fetch(`${API_BASE_URL}/products/?${params.toString()}`, {
		method: 'GET',
		credentials: 'include',
	});
	if (!response.ok) {
		throw new Error('Failed to fetch products');
	}
	return response.json();
}

async function getProductById(idProduit) {
	const response = await fetch(`${API_BASE_URL}/products/${idProduit}`, {
		method: 'GET',
		credentials: 'include',
	});
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error || 'Failed to fetch product');
	}
	return data;
}

const productsService = { getListProducts, getProductById };

export default productsService;
