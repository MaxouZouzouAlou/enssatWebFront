import React, { useEffect, useState } from 'react';
import achatService from '../services/achatPage';
import ProductGrid from '../components/ProductGrid';

function Achat({ addToCart = () => {} }) {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		achatService.getListProducts()
			.then((data) => {
				if (mounted) setProducts(data || []);
			})
			.catch((err) => {
				if (mounted) setError(err.message || 'Erreur lors de la récupération');
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, []);

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
				<div className="text-green-700 font-semibold">Chargement des produits…</div>
			</div>
		);
	if (error)
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
				<div className="text-red-600">Erreur: {error}</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="mb-6">
					<h1 className="text-3xl font-extrabold text-green-800">Marché local</h1>
					<p className="text-sm text-green-600">Produits frais, de saison et respectueux de la nature</p>
				</div>

				<ProductGrid products={products} addToCart={addToCart} />
			</div>
		</div>
	);
}

export default Achat;
