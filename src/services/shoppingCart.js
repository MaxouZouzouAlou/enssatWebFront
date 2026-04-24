import { requestOptionalJson } from './http-client.js';

async function getShoppingCarts() {
    return requestOptionalJson('/shoppingCart', {
        method: 'GET',
        fallbackMessage: 'Failed to fetch shopping carts'
    });
}

async function getCurrentShoppingCart() {
    return requestOptionalJson('/shoppingCart/me', {
        method: 'POST',
        fallbackMessage: 'Failed to resolve shopping cart'
    });
}

async function getCurrentShoppingCartItems() {
    return requestOptionalJson('/shoppingCart/me/items', {
        method: 'GET',
        fallbackMessage: 'Failed to fetch shopping cart items'
    });
}

async function getShoppingCartItems(idPanier) {
    return requestOptionalJson(`/shoppingCart/${idPanier}/items`, {
        method: 'GET',
        fallbackMessage: 'Failed to fetch shopping cart items'
    });
}

async function addProductToShoppingCart(idProduit, quantite = 1) {
    return requestOptionalJson('/shoppingCart/item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idProduit, quantite }),
        fallbackMessage: 'Failed to add product to shopping cart'
    });
}

async function removeProductFromShoppingCart(idProduit, quantite = 1) {
    return requestOptionalJson('/shoppingCart/single', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idProduit, quantite }),
        fallbackMessage: 'Failed to remove product from shopping cart'
    });
}

async function removeProductsFromShoppingCart(idProduit) {
    return requestOptionalJson('/shoppingCart/list', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idProduit }),
        fallbackMessage: 'Failed to remove product from shopping cart'
    });
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
