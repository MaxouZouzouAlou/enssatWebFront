import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router';
import achatService from '../services/achatPage';
import ProductGrid from '../components/ProductGrid';
import ProductFilter from '../components/ProductFilter';
import ProductSort from '../components/ProductSort';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';

function AchatPage() {
	const { addToCart } = useOutletContext();
	const [products, setProducts] = useState([]);
	const [selectedNatures, setSelectedNatures] = useState([]);
	const [sortOrder, setSortOrder] = useState('none');
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

	// Memoized filtered and sorted products
	const filteredAndSortedProducts = useMemo(() => {
		let result = selectedNatures.length > 0 
			? products.filter(p => selectedNatures.includes(p.nature))
			: products;

		// Apply sorting
		switch (sortOrder) {
			case 'price-asc':
				result = [...result].sort((a, b) => {
					const priceA = parseFloat(a.prix ?? a.price ?? 0);
					const priceB = parseFloat(b.prix ?? b.price ?? 0);
					return priceA - priceB;
				});
				break;
			case 'price-desc':
				result = [...result].sort((a, b) => {
					const priceA = parseFloat(a.prix ?? a.price ?? 0);
					const priceB = parseFloat(b.prix ?? b.price ?? 0);
					return priceB - priceA;
				});
				break;
			case 'name-asc':
				result = [...result].sort((a, b) => {
					const nameA = (a.nom ?? a.name ?? '').toLowerCase();
					const nameB = (b.nom ?? b.name ?? '').toLowerCase();
					return nameA.localeCompare(nameB, 'fr');
				});
				break;
			case 'name-desc':
				result = [...result].sort((a, b) => {
					const nameA = (a.nom ?? a.name ?? '').toLowerCase();
					const nameB = (b.nom ?? b.name ?? '').toLowerCase();
					return nameB.localeCompare(nameA, 'fr');
				});
				break;
			default:
				break;
		}

		return result;
	}, [products, selectedNatures, sortOrder]);

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
				<ProductFilter 
					products={products} 
					selectedNatures={selectedNatures}
					onNatureChange={setSelectedNatures}
				/>
				<ProductSort 
					sortOrder={sortOrder}
					onSortChange={setSortOrder}
				/>
				<ProductGrid 
					products={filteredAndSortedProducts} 
					addToCart={addToCart} 
				/>
			</div>
		</PageShell>
	);
}

export default AchatPage;
