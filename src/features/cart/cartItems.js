export const EMPTY_CART = [];

export function getProductId(product) {
	return product?.idProduit ?? product?.id ?? product?._id ?? null;
}

export function mapCartItem(item) {
	return {
		product: {
			idProduit: item.idProduit,
			id: item.idProduit,
			nom: item.nomProduit ?? item.nom ?? item.name,
			prix: item.prix ?? item.price,
			nature: item.nature,
			stock: item.stock,
			bio: item.bio,
			visible: item.visible,
			unitaireOuKilo: item.unitaireOuKilo,
			tva: item.tva,
			reductionProfessionnel: item.reductionProfessionnel,
			idProfessionnel: item.idProfessionnel
		},
		quantity: Number(item.quantite ?? item.quantity ?? 1)
	};
}

export function addLocalQuantity(currentItems, product, quantity) {
	const productId = getProductId(product);
	const matchIndex = currentItems.findIndex((item) => getProductId(item.product) === productId);

	if (matchIndex !== -1) {
		const copy = [...currentItems];
		copy[matchIndex] = {
			...copy[matchIndex],
			quantity: Number((copy[matchIndex].quantity + quantity).toFixed(3))
		};
		return copy;
	}

	return [...currentItems, { product, quantity }];
}
