import { API_BASE_URL } from './auth-client.js';

async function getListProducts() {
	const response = await fetch(`${API_BASE_URL}/products/`, {
		method: 'GET',
		credentials: 'include',
	});
	if (!response.ok) {
		throw new Error('Failed to fetch products');
	}
	return response.json();
}

async function addProductToShoppingCart(idProduit) {
	const response = await fetch(`${API_BASE_URL}/shoppingCart/item`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify({ idPanier: 6, idProduit }),
	});
	if (!response.ok) {
		throw new Error('Failed to add product to shopping cart');
	}
	return response.json();
}

const achatService = { getListProducts, addProductToShoppingCart };

export default achatService;
