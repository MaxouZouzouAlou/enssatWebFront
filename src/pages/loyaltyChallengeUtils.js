export function isChallengeEligible(challenge) {
	return Boolean(challenge?.canClaim) && challenge?.conditionsRemplies === true;
}

export function getChallengeActionLabel(challenge) {
	if (!challenge?.canClaim) return 'Defi termine';
	if (challenge?.conditionsRemplies === true) return 'Valider le defi';
	return 'Conditions non remplies';
}
