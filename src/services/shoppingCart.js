import { API_BASE_URL } from './auth-client.js';

async function getShoppingCarts() {
    const response = await fetch(`${API_BASE_URL}/shoppingCart`, {
        method: 'GET',
        credentials: 'include'
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error('Failed to fetch shopping carts' + (errText ? `: ${errText}` : ''));
    }

    return response.json();
}

async function getCurrentShoppingCart() {
    const response = await fetch(`${API_BASE_URL}/shoppingCart/me`, {
        method: 'POST',
        credentials: 'include'
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error('Failed to resolve shopping cart' + (errText ? `: ${errText}` : ''));
    }

    return response.json();
}

async function getShoppingCartItems(idPanier) {
    const response = await fetch(`${API_BASE_URL}/shoppingCart/${idPanier}/items`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error('Failed to fetch shopping cart items' + (errText ? `: ${errText}` : ''));
    }

    const text = await response.text().catch(() => '');
    if (!text) return null;

    try {
        const result = JSON.parse(text);
        return result;
    } catch (err) {
        console.warn('getShoppingCartItems: response not JSON', text);
        return null;
    }
}

async function addProductToShoppingCart(idPanier, idProduit, quantite = 1) {
    const response = await fetch(`${API_BASE_URL}/shoppingCart/item`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ idPanier: idPanier, idProduit: idProduit, quantite: quantite })
    });

	if (!response.ok) {
		const errText = await response.text().catch(() => '');
		throw new Error('Failed to add product to shopping cart' + (errText ? `: ${errText}` : ''));
	}

	const text = await response.text().catch(() => '');
	if (!text) return null;

	try {
		const result = JSON.parse(text);
		return result;
	} catch (err) {
		console.warn('addProductToShoppingCart: response not JSON', text);
		return null;
	}
}

async function removeProductFromShoppingCart(idPanier, idProduit, quantite = 1) {
    const response = await fetch(`${API_BASE_URL}/shoppingCart/single`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ idPanier: idPanier, idProduit: idProduit, quantite: quantite })
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error('Failed to remove product from shopping cart' + (errText ? `: ${errText}` : ''));
    }

    const text = await response.text().catch(() => '');
    if (!text) return null;

    try {
        const result = JSON.parse(text);
        return result;
    } catch (err) {
        console.warn('removeProductFromShoppingCart: response not JSON', text);
        return null;
    }
}

async function removerProductsFromShoppingCart(idPanier, idProduit) {
    const response = await fetch(`${API_BASE_URL}/shoppingCart/list`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ idPanier: idPanier, idProduit: idProduit })
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error('Failed to remove product from shopping cart' + (errText ? `: ${errText}` : ''));
    }

    const text = await response.text().catch(() => '');
    if (!text) return null;

    try {
        const result = JSON.parse(text);
        return result;
    } catch (err) {
        console.warn('removerProductsFromShoppingCart: response not JSON', text);
        return null;
    }
}

const shoppingCart = { addProductToShoppingCart, getShoppingCartItems, removeProductFromShoppingCart, removerProductsFromShoppingCart };

export default shoppingCart;
