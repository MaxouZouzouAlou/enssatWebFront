import { euro, formatTrend, number } from './formatters';

test('euro formats a price in French locale', () => {
	expect(euro.format(1234.5)).toBe('1 234,50 €');
});

test('number formats an integer in French locale', () => {
	expect(number.format(1000)).toBe('1 000');
});

test('formatTrend prefixes positive values with +', () => {
	expect(formatTrend(3.5)).toBe('+3.5% vs periode precedente');
});

test('formatTrend leaves negative values unprefixed', () => {
	expect(formatTrend(-1.2)).toBe('-1.2% vs periode precedente');
});

test('formatTrend treats null/undefined as 0', () => {
	expect(formatTrend(null)).toBe('0.0% vs periode precedente');
	expect(formatTrend(undefined)).toBe('0.0% vs periode precedente');
});
