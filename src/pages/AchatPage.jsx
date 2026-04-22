import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import achatService from '../services/achatPage';
import ProductGrid from '../components/ProductGrid';
import { PageShell, SectionHeader, SurfaceCard } from '../components/layout';

function AchatPage() {
	const { addToCart } = useOutletContext();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		achatService
			.getListProducts()
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

	if (loading) {
		return (
			<PageShell contentClassName="flex min-h-[50vh] items-center justify-center">
				<SurfaceCard className="text-center">
					<p className="text-sm font-semibold text-primary-700">Chargement des produits...</p>
				</SurfaceCard>
			</PageShell>
		);
	}

	if (error) {
		return (
			<PageShell contentClassName="flex min-h-[50vh] items-center justify-center">
				<SurfaceCard className="max-w-xl text-center">
					<p className="text-sm font-semibold text-red-700">Erreur : {error}</p>
				</SurfaceCard>
			</PageShell>
		);
	}

	return (
		<PageShell>
			<SectionHeader
				eyebrow="Marché local"
				title="Produits disponibles"
			>
				<p>Produits frais, de saison et proposés par les producteurs référencés.</p>
			</SectionHeader>
			<div className="mt-10">
				<ProductGrid products={products} addToCart={addToCart} />
			</div>
		</PageShell>
	);
}

export default AchatPage;
