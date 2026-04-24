import { render, screen } from '@testing-library/react';
import CheckoutSummaryCard from './CheckoutSummaryCard.jsx';

test('shows selected delivery fees even before a checkout preview exists', () => {
	render(
		<CheckoutSummaryCard
			cartItems={[
				{
					product: {
						idProduit: 1,
						nom: 'Pommes',
						prix: 2,
						tva: 5.5,
						reductionProfessionnel: 0
					},
					quantity: 2
				}
			]}
			fallbackDeliveryFees={3.9}
		/>
	);

	expect(screen.getByText('Frais de livraison')).toBeInTheDocument();
	expect(screen.getByText('3.90 €')).toBeInTheDocument();
	expect(screen.getByText('8.12 €')).toBeInTheDocument();
});
