import { fireEvent, render, screen } from '@testing-library/react';
import ProductCard from './ProductCard.jsx';

test('opens product detail when clicking the product card', () => {
	const onOpenProduct = jest.fn();
	const product = {
		idProduit: 42,
		nom: 'Pommes',
		prix: 2.5,
		nature: 'Fruit',
		visible: true,
		stock: 10,
		idProfessionnel: 7,
	};

	render(<ProductCard product={product} onOpenProduct={onOpenProduct} />);

	fireEvent.click(screen.getByRole('button', { name: /voir le produit pommes/i }));

	expect(onOpenProduct).toHaveBeenCalledWith(product);
});

test('keeps action buttons from triggering the product click', () => {
	const onAdd = jest.fn();
	const onOpenProduct = jest.fn();
	const product = {
		idProduit: 42,
		nom: 'Pommes',
		prix: 2.5,
		nature: 'Fruit',
		visible: true,
		stock: 10,
		idProfessionnel: 7,
	};

	render(<ProductCard product={product} onAdd={onAdd} onOpenProduct={onOpenProduct} />);

	fireEvent.click(screen.getByLabelText('Ajouter au panier'));

	expect(onAdd).toHaveBeenCalled();
	expect(onOpenProduct).not.toHaveBeenCalled();
});

test('renders backend image paths as absolute API URLs', () => {
	const product = {
		idProduit: 99,
		nom: 'Tomates',
		prix: 3.2,
		nature: 'Légume',
		visible: true,
		stock: 5,
		idProfessionnel: 4,
		imagePath: '/images/produits/tomates.jpg',
	};

	render(<ProductCard product={product} />);

	const image = screen.getByRole('img', { name: /tomates/i });
	expect(image).toHaveAttribute('src', 'http://localhost:49161/images/produits/tomates.jpg');
});

test('renders the company name when provided by the products API', () => {
	const product = {
		idProduit: 11,
		nom: 'Confiture',
		prix: 4.8,
		nature: 'Autre',
		visible: true,
		stock: 12,
		idProfessionnel: 1,
		entrepriseNom: 'Conserverie du Tregor',
	};

	render(<ProductCard product={product} />);

	expect(screen.getByText('Conserverie du Tregor')).toBeInTheDocument();
});
