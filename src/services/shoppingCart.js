import { API_BASE_URL } from './auth-client.js';

async function parseOptionalJson(response, fallbackMessage) {
    const text = await response.text().catch(() => '');

    if (!response.ok) {
        let details = text;
        try {
            const data = text ? JSON.parse(text) : {};
            details = data.error || data.message || text;
        } catch (err) {
            details = text;
        }
        throw new Error(fallbackMessage + (details ? `: ${details}` : ''));
    }

    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch (err) {
        console.warn('shoppingCartService: response not JSON', text);
        return null;
    }
}

async function getShoppingCarts() {
    const response = await fetch(`${API_BASE_URL}/shoppingCart`, {
        method: 'GET',
        credentials: 'include'
    });

    return parseOptionalJson(response, 'Failed to fetch shopping carts');
}

async function getCurrentShoppingCart() {
    const response = await fetch(`${API_BASE_URL}/shoppingCart/me`, {
        method: 'POST',
        credentials: 'include'
    });

    return parseOptionalJson(response, 'Failed to resolve shopping cart');
}

async function getCurrentShoppingCartItems() {
    const response = await fetch(`${API_BASE_URL}/shoppingCart/me/items`, {
        method: 'GET',
        credentials: 'include'
    });

    return parseOptionalJson(response, 'Failed to fetch shopping cart items');
}

async function getShoppingCartItems(idPanier) {
    const response = await fetch(`${API_BASE_URL}/shoppingCart/${idPanier}/items`, {
        method: 'GET',
        credentials: 'include'
    });

    return parseOptionalJson(response, 'Failed to fetch shopping cart items');
}

async function addProductToShoppingCart(idProduit, quantite = 1) {
    const response = await fetch(`${API_BASE_URL}/shoppingCart/item`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ idProduit, quantite })
    });

    return parseOptionalJson(response, 'Failed to add product to shopping cart');
}

async function removeProductFromShoppingCart(idProduit, quantite = 1) {
    const response = await fetch(`${API_BASE_URL}/shoppingCart/single`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ idProduit, quantite })
    });

    return parseOptionalJson(response, 'Failed to remove product from shopping cart');
}

async function removeProductsFromShoppingCart(idProduit) {
    const response = await fetch(`${API_BASE_URL}/shoppingCart/list`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ idProduit })
    });

    return parseOptionalJson(response, 'Failed to remove product from shopping cart');
}

const shoppingCartService = {
    addProductToShoppingCart,
    getCurrentShoppingCart,
    getCurrentShoppingCartItems,
    getShoppingCartItems,
    getShoppingCarts,
    removeProductFromShoppingCart,
    removeProductsFromShoppingCart
};

export default shoppingCartService;
