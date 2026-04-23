import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import Alert from '../components/Alert.jsx';
import ProductGrid from '../components/ProductGrid';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import CatalogFiltersPanel from '../features/catalog/CatalogFiltersPanel.jsx';
import productsService from '../services/products';

const DEFAULT_PAGE_SIZE = 9;

function hasPersonalAddress(profile, accountType) {
	if (accountType !== 'particulier') return false;
	const address = profile?.particulier || profile?.client;
	return Boolean(address?.adresse_ligne && address?.code_postal && address?.ville);
}

function buildDefaultFilters(profile, accountType) {
	return {
		sort: hasPersonalAddress(profile, accountType) ? 'proximity' : 'alpha_asc',
		natures: [],
		bio: 'all',
		enStock: false,
		prixMin: '',
		prixMax: ''
	};
}

function normalizeNumericFilter(value) {
	if (value === '') return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function hasActiveCatalogFilters(filters, searchValue, defaultSort) {
	return Boolean(
		String(searchValue || '').trim() ||
		filters.natures.length ||
		filters.bio !== 'all' ||
		filters.enStock ||
		filters.prixMin !== '' ||
		filters.prixMax !== '' ||
		filters.sort !== defaultSort
	);
}

function ProductsPage() {
	const { addToCart, cartError, clearCartError, profile, accountType } = useOutletContext();
	const navigate = useNavigate();
	const defaultFilters = useMemo(() => buildDefaultFilters(profile, accountType), [profile, accountType]);
	const [filters, setFilters] = useState(defaultFilters);
	const [searchValue, setSearchValue] = useState('');
	const deferredSearch = useDeferredValue(searchValue);
	const [products, setProducts] = useState([]);
	const [availableNatures, setAvailableNatures] = useState([]);
	const [sortApplied, setSortApplied] = useState(defaultFilters.sort);
	const [proximityAvailable, setProximityAvailable] = useState(defaultFilters.sort === 'proximity');
	const [pagination, setPagination] = useState({
		page: 1,
		limit: DEFAULT_PAGE_SIZE,
		total: 0,
		totalPages: 1,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [sortTouched, setSortTouched] = useState(false);

	useEffect(() => {
		if (!sortTouched) {
			setFilters((current) => ({ ...current, sort: defaultFilters.sort }));
			setSortApplied(defaultFilters.sort);
			setProximityAvailable(defaultFilters.sort === 'proximity');
		}
	}, [defaultFilters, sortTouched]);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		setError(null);

		productsService
			.getListProducts({
				page: pagination.page,
				limit: pagination.limit,
				q: deferredSearch,
				natures: filters.natures,
				bio: filters.bio === 'all' ? null : filters.bio === 'bio',
				enStock: filters.enStock ? true : null,
				prixMin: normalizeNumericFilter(filters.prixMin),
				prixMax: normalizeNumericFilter(filters.prixMax),
				sort: filters.sort
			})
			.then((data) => {
				if (!mounted) return;
				if (Array.isArray(data)) {
					setProducts(data);
					setAvailableNatures([]);
					setSortApplied(filters.sort);
					setProximityAvailable(filters.sort === 'proximity');
					setPagination((current) => ({
						...current,
						total: data.length,
						totalPages: 1,
					}));
					return;
				}

				setProducts(data?.items || []);
				setAvailableNatures(Array.isArray(data?.availableNatures) ? data.availableNatures : []);
				setSortApplied(data?.sortApplied || filters.sort);
				setProximityAvailable(Boolean(data?.proximityAvailable));
				setPagination((current) => ({
					...current,
					page: data?.page || current.page,
					limit: data?.limit || current.limit,
					total: data?.total || 0,
					totalPages: data?.totalPages || 1,
				}));
			})
			.catch((fetchError) => {
				if (mounted) setError(fetchError.message || 'Erreur lors de la récupération');
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, [deferredSearch, filters, pagination.limit, pagination.page]);

	const goToPage = (nextPage) => {
		setPagination((current) => ({
			...current,
			page: Math.min(Math.max(1, nextPage), current.totalPages),
		}));
	};

	const updateFilter = (field, value) => {
		setPagination((current) => ({ ...current, page: 1 }));
		setFilters((current) => ({ ...current, [field]: value }));
		if (field === 'sort') setSortTouched(true);
	};

	const toggleNature = (nature) => {
		setPagination((current) => ({ ...current, page: 1 }));
		setFilters((current) => ({
			...current,
			natures: current.natures.includes(nature)
				? current.natures.filter((entry) => entry !== nature)
				: [...current.natures, nature]
		}));
	};

	const resetFilters = () => {
		setFilters(defaultFilters);
		setSearchValue('');
		setSortTouched(false);
		setPagination((current) => ({ ...current, page: 1 }));
	};

	const openProduct = (product) => {
		const idProduit = product.idProduit ?? product.id ?? product._id;
		if (idProduit == null) return;
		navigate(`/produits/${idProduit}`);
	};

	const hasActiveFilters = hasActiveCatalogFilters(filters, searchValue, defaultFilters.sort);

	if (loading && !products.length) {
		return (
			<PageShell contentClassName="flex min-h-[50vh] items-center justify-center">
				<SurfaceCard className="text-center">
					<p className="text-sm font-semibold text-primary-700">Chargement des produits...</p>
				</SurfaceCard>
			</PageShell>
		);
	}

	if (error && !products.length) {
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
				<p>Parcourez le catalogue, filtrez par besoin et laissez le tri par proximite remonter les producteurs les plus proches quand votre adresse perso est renseignee.</p>
			</SectionHeader>

			{cartError ? (
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
			) : null}

			<CatalogFiltersPanel
				searchValue={searchValue}
				filters={filters}
				availableNatures={availableNatures}
				onSearchChange={(value) => {
					setSearchValue(value);
					setPagination((current) => ({ ...current, page: 1 }));
				}}
				onToggleNature={toggleNature}
				onFieldChange={updateFilter}
				onReset={resetFilters}
				hasActiveFilters={hasActiveFilters}
				total={pagination.total}
				sortApplied={sortApplied}
				proximityAvailable={proximityAvailable}
			/>

			{error ? (
				<div className="mt-6">
					<Alert>
						<div className="flex items-start justify-between gap-4">
							<span>{error}</span>
							<button
								type="button"
								onClick={() => setError(null)}
								className="text-xs font-semibold uppercase tracking-[0.12em] text-red-800 hover:text-red-950"
							>
								Fermer
							</button>
						</div>
					</Alert>
				</div>
			) : null}

			<div className="mt-10">
				<ProductGrid products={products} addToCart={addToCart} onOpenProduct={openProduct} />
			</div>

			{pagination.totalPages > 1 ? (
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
							Precedent
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
			) : null}
		</PageShell>
	);
}

export default ProductsPage;
