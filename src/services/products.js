import { API_BASE_URL } from './auth-client.js';

async function getListProducts({ page = 1, limit = 9 } = {}) {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
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
