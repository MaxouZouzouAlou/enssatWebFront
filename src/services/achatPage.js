async function getListProducts() {
	const response = await fetch('http://localhost:49161/products/', {
		method: 'GET'
	});
	if (!response.ok) {
		throw new Error('Failed to fetch products');
	}
	const products = await response.json();
	return products;
}

async function addProductToShoppingCart(idProduit) {
	const response = await fetch('http://localhost:49161/shoppingCart/item', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ idPanier: 6,idProduit: idProduit })
	});
	if (!response.ok) {
		throw new Error('Failed to add product to shopping cart');
	}
	const result = await response.json();
	return result;
}

// async function updateShoppingList() {
// 	const response = await fetch('http://localhost:49161/shopping-list/', {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		},
// 		body: JSON.stringify({ /* TODO: shopping list data */ })
// 	});
// 	if (!response.ok) {
// 		throw new Error('Failed to update shopping list');
// 	}
// 	const result = await response.json();
// 	return result;
// }

export default { getListProducts, addProductToShoppingCart };