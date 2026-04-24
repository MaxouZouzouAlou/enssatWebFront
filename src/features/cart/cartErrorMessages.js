export function getCartErrorMessage(err) {
	const message = err?.message || '';

	if (message.includes('Non authentifi') || message.includes('401')) {
		return 'Votre session a expiré. Reconnectez-vous pour modifier votre panier.';
	}

	if (message.includes('Stock insuffisant')) {
		return 'Stock insuffisant pour ce produit.';
	}

	if (message.includes('Quantite invalide') || message.includes('quantite doit etre entiere')) {
		return 'Quantité invalide pour ce produit.';
	}

	if (message.includes('Produit introuvable')) {
		return "Ce produit n'est plus disponible.";
	}

	return "Impossible de mettre à jour le panier pour le moment.";
}
