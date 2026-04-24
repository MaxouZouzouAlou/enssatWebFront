import { getChallengeActionLabel, isChallengeEligible } from '../loyaltyChallengeUtils.js';

test('does not allow challenge claiming without explicit verified conditions', () => {
	const challenge = {
		code: 'FIRST_ORDER',
		canClaim: true,
		conditionsRemplies: false,
	};

	expect(isChallengeEligible(challenge)).toBe(false);
	expect(getChallengeActionLabel(challenge)).toBe('Conditions non remplies');
});

test('allows challenge claiming only when the conditions are explicitly verified', () => {
	const challenge = {
		code: 'FIRST_ORDER',
		canClaim: true,
		conditionsRemplies: true,
	};

	expect(isChallengeEligible(challenge)).toBe(true);
	expect(getChallengeActionLabel(challenge)).toBe('Valider le défi');
});
