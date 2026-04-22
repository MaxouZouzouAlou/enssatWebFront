import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import Alert from '../components/Alert.jsx';
import ProductGrid from '../components/ProductGrid';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import productsService from '../services/products';

function ProductsPage() {
	const { addToCart, cartError, clearCartError } = useOutletContext();
	const [products, setProducts] = useState([]);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 9,
		total: 0,
		totalPages: 1,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		setError(null);
		productsService
			.getListProducts({ page: pagination.page, limit: pagination.limit })
			.then((data) => {
				if (!mounted) return;
				if (Array.isArray(data)) {
					setProducts(data);
					setPagination((current) => ({
						...current,
						total: data.length,
						totalPages: 1,
					}));
					return;
				}
				setProducts(data?.items || []);
				setPagination((current) => ({
					...current,
					page: data?.page || current.page,
					limit: data?.limit || current.limit,
					total: data?.total || 0,
					totalPages: data?.totalPages || 1,
				}));
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
	}, [pagination.limit, pagination.page]);

	const goToPage = (nextPage) => {
		setPagination((current) => ({
			...current,
			page: Math.min(Math.max(1, nextPage), current.totalPages),
		}));
	};

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
			{cartError && (
				<div className="mt-6">
					<Alert>
						<div className="flex items-start justify-between gap-4">
							<span>{cartError}</span>
							<button
								type="button"
								onClick={clearCartError}
								className="text-xs font-semibold uppercase tracking-[0.12em] text-red-800 hover:text-red-950"
							>
								Fermer
							</button>
						</div>
					</Alert>
				</div>
			)}
			<div className="mt-10">
				<ProductGrid products={products} addToCart={addToCart} />
			</div>
			{pagination.totalPages > 1 && (
				<div className="mt-8 flex flex-col gap-3 rounded-2xl bg-neutral-50 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm font-semibold text-secondary-600">
						Page {pagination.page} sur {pagination.totalPages} · {pagination.total} produits
					</p>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => goToPage(pagination.page - 1)}
							disabled={pagination.page <= 1 || loading}
							className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Précédent
						</button>
						<button
							type="button"
							onClick={() => goToPage(pagination.page + 1)}
							disabled={pagination.page >= pagination.totalPages || loading}
							className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Suivant
						</button>
					</div>
				</div>
			)}
		</PageShell>
	);
}

export default ProductsPage;
