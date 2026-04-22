async function getShoppingCartItems(idPanier) {
    const response = await fetch(`http://localhost:49161/shoppingCart/${idPanier}/items`, {
        method: 'GET',
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

async function addProductToShoppingCart(idPanier, idProduit) {
	const response = await fetch('http://localhost:49161/shoppingCart/item', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ idPanier: 6, idProduit: idProduit })
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

async function removeProductFromShoppingCart(idPanier, idProduit) {
    const response = await fetch('http://localhost:49161/shoppingCart/single', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idPanier: 6, idProduit: idProduit })
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
    const response = await fetch('http://localhost:49161/shoppingCart/list', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idPanier: 6, idProduit: idProduit })
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

export default { addProductToShoppingCart, getShoppingCartItems, removeProductFromShoppingCart, removerProductsFromShoppingCart };