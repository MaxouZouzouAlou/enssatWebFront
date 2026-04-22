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

export default { getListProducts };