import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router';
import Alert from '../components/Alert.jsx';
import ProductGrid from '../components/ProductGrid';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import CatalogFiltersPanel from '../features/catalog/CatalogFiltersPanel.jsx';
import productsService from '../services/products';
import { queryKeys } from '../utils/queryKeys.js';

const DEFAULT_PAGE_SIZE = 9;
const PAGE_SIZE_OPTIONS = [9, 18, 27, 36];

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
	const [pagination, setPagination] = useState({
		page: 1,
		limit: DEFAULT_PAGE_SIZE,
	});
	const [sortTouched, setSortTouched] = useState(false);

	useEffect(() => {
		if (!sortTouched) {
			setFilters((current) => ({ ...current, sort: defaultFilters.sort }));
		}
	}, [defaultFilters, sortTouched]);

	const catalogParams = useMemo(() => ({
		page: pagination.page,
		limit: pagination.limit,
		q: deferredSearch,
		natures: filters.natures,
		bio: filters.bio === 'all' ? null : filters.bio === 'bio',
		enStock: filters.enStock ? true : null,
		prixMin: normalizeNumericFilter(filters.prixMin),
		prixMax: normalizeNumericFilter(filters.prixMax),
		sort: filters.sort
	}), [deferredSearch, filters, pagination.limit, pagination.page]);

	const {
		data: catalogData,
		error,
		isLoading,
		isFetching
	} = useQuery({
		queryKey: queryKeys.products.list(catalogParams),
		queryFn: () => productsService.getListProducts(catalogParams),
		placeholderData: (previousData) => previousData,
	});

	const products = useMemo(() => {
		if (Array.isArray(catalogData)) return catalogData;
		return catalogData?.items || [];
	}, [catalogData]);
	const availableNatures = Array.isArray(catalogData?.availableNatures) ? catalogData.availableNatures : [];
	const sortApplied = Array.isArray(catalogData) ? filters.sort : (catalogData?.sortApplied || filters.sort);
	const proximityAvailable = Array.isArray(catalogData) ? filters.sort === 'proximity' : Boolean(catalogData?.proximityAvailable);
	const total = Array.isArray(catalogData) ? products.length : Number(catalogData?.total || 0);
	const totalPages = Array.isArray(catalogData) ? 1 : Number(catalogData?.totalPages || 1);

	const goToPage = (nextPage) => {
		setPagination((current) => ({
			...current,
			page: Math.min(Math.max(1, nextPage), totalPages),
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

	const updatePageSize = (nextLimit) => {
		setPagination((current) => ({
			...current,
			page: 1,
			limit: Number(nextLimit)
		}));
	};

	const hasActiveFilters = hasActiveCatalogFilters(filters, searchValue, defaultFilters.sort);

	if (isLoading && !products.length) {
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
					<p className="text-sm font-semibold text-red-700">Erreur : {error.message || 'Erreur lors de la récupération'}</p>
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
				<p>Parcourez le catalogue, filtrez par besoin et laissez le tri par proximité remonter les producteurs les plus proches quand votre adresse perso est renseignée.</p>
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
				total={total}
				sortApplied={sortApplied}
				proximityAvailable={proximityAvailable}
			/>

			{error ? (
				<div className="mt-6">
					<Alert>
						<div className="flex items-start justify-between gap-4">
							<span>{error.message || 'Erreur lors de la récupération'}</span>
						</div>
					</Alert>
				</div>
			) : null}

			<div className="mt-10">
				<ProductGrid products={products} addToCart={addToCart} onOpenProduct={openProduct} />
			</div>

			{totalPages > 1 || total > 0 ? (
				<div className="mt-8 flex flex-col gap-3 rounded-2xl bg-neutral-50 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
						<p className="text-sm font-semibold text-secondary-600">
							Page {pagination.page} sur {totalPages} · {total} produits{isFetching && !isLoading ? ' · mise à jour...' : ''}
						</p>
						<label className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-700">
							<span>Articles par page</span>
							<select
								value={pagination.limit}
								onChange={(event) => updatePageSize(event.target.value)}
								className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-secondary-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
							>
								{PAGE_SIZE_OPTIONS.map((option) => (
									<option key={option} value={option}>{option}</option>
								))}
							</select>
						</label>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => goToPage(pagination.page - 1)}
							disabled={pagination.page <= 1 || isFetching}
							className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Precedent
						</button>
						<button
							type="button"
							onClick={() => goToPage(pagination.page + 1)}
							disabled={pagination.page >= totalPages || isFetching}
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
