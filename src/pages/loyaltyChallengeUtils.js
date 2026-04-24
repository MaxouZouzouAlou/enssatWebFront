export function isChallengeEligible(challenge) {
	return Boolean(challenge?.canClaim) && challenge?.conditionsRemplies === true;
}

export function getChallengeActionLabel(challenge) {
	if (!challenge?.canClaim) return 'Défi terminé';
	if (challenge?.conditionsRemplies === true) return 'Valider le défi';
	return 'Conditions non remplies';
}
