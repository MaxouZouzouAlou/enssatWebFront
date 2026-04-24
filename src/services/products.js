import { request, requestJson } from './http-client.js';

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

	const response = await request(`/products/?${params.toString()}`, {
		method: 'GET',
	});
	if (!response.ok) {
		throw new Error('Failed to fetch products');
	}
	return response.json();
}

async function getProductById(idProduit) {
	return requestJson(`/products/${idProduit}`, {
		method: 'GET',
		defaultMessage: 'Failed to fetch product'
	});
}

const productsService = { getListProducts, getProductById };

export default productsService;
