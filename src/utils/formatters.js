export const euro = new Intl.NumberFormat('fr-FR', { currency: 'EUR', style: 'currency' });
export const number = new Intl.NumberFormat('fr-FR');

export function formatTrend(value) {
	const trend = Number(value || 0);
	const prefix = trend > 0 ? '+' : '';
	return `${prefix}${trend.toFixed(1)}% vs periode precedente`;
}
