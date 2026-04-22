export function getProductId(product) {
	return product?.idProduit ?? product?.id ?? product?._id ?? null;
}

export function isUnitProduct(product) {
	return product?.unitaireOuKilo === 1 || product?.unitaireOuKilo === true;
}

export function quantityToDisplayValue(product, quantity) {
	if (isUnitProduct(product)) return String(Math.max(1, Math.round(Number(quantity) || 1)));
	const kilograms = Number(quantity) || 0.1;
	if (kilograms >= 1) return String(Number(kilograms.toFixed(1)));
	return String(Math.max(100, Math.round(kilograms * 1000)));
}

export function displayValueToCartQuantity(product, value, unit = null) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) return isUnitProduct(product) ? 1 : 0.1;
	if (isUnitProduct(product)) return Math.max(1, Math.round(parsed));
	if (unit === 'kg') return Number(Math.max(1, parsed).toFixed(3));
	return Number((Math.max(100, parsed) / 1000).toFixed(3));
}

export function getQuantityInputConfig(product) {
	return isUnitProduct(product)
		? { min: 1, step: 1, suffix: 'u' }
		: { min: 100, step: 100, suffix: 'g' };
}

export function getWeightDisplayUnit(quantity) {
	return Number(quantity) >= 1 ? 'kg' : 'g';
}

export function getDisplayUnit(product, quantity) {
	if (isUnitProduct(product)) return 'u';
	return getWeightDisplayUnit(quantity);
}

export function getDisplayConfig(product, quantity) {
	if (isUnitProduct(product)) return { min: 1, step: 1, suffix: 'u' };
	const unit = getWeightDisplayUnit(quantity);
	return unit === 'kg'
		? { min: 1, step: 0.1, suffix: 'kg' }
		: { min: 100, step: 100, suffix: 'g' };
}

export function normalizeWeightInput(value) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 1000) {
		return { value: String(Math.max(100, parsed || 100)), unit: 'g' };
	}
	return { value: (parsed / 1000).toFixed(1), unit: 'kg' };
}

export function formatCartQuantity(product, quantity) {
	const numericQuantity = Number(quantity) || 0;

	if (isUnitProduct(product)) {
		const units = Math.max(1, Math.round(numericQuantity));
		return `${units} ${units > 1 ? 'unites' : 'unite'}`;
	}

	const grams = Math.round(numericQuantity * 1000);
	if (grams < 1000) return `${grams} grammes`;

	const kilograms = grams / 1000;
	return `${kilograms.toFixed(1)} ${kilograms >= 2 ? 'kilogrammes' : 'kilogramme'}`;
}

export function formatProductStock(product, stock) {
	const numericStock = Number(stock);
	if (!Number.isFinite(numericStock)) return null;

	if (isUnitProduct(product)) {
		return `${numericStock} ${numericStock > 1 ? 'unites' : 'unite'} en stock`;
	}

	if (numericStock < 1000) return `${numericStock} g disponibles`;

	return `${(numericStock / 1000).toFixed(1)} kg disponibles`;
}
