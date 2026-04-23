const SORT_OPTIONS = [
	{ value: 'proximity', label: 'Proximite' },
	{ value: 'rating_desc', label: 'Popularite' },
	{ value: 'alpha_asc', label: 'Alphabetique A-Z' },
	{ value: 'alpha_desc', label: 'Alphabetique Z-A' },
	{ value: 'stock_desc', label: 'Stock disponible' }
];

const BIO_OPTIONS = [
	{ value: 'all', label: 'Tous' },
	{ value: 'bio', label: 'Bio uniquement' },
	{ value: 'non_bio', label: 'Non bio' }
];

export default function CatalogFiltersPanel({
	searchValue,
	filters,
	availableNatures = [],
	onSearchChange,
	onToggleNature,
	onFieldChange,
	onReset,
	hasActiveFilters = false,
	total = 0,
	sortApplied = 'alpha_asc',
	proximityAvailable = false
}) {
	const proximityFallback = filters.sort === 'proximity' && !proximityAvailable && sortApplied !== 'proximity';

	return (
		<section className="mt-8 rounded-[2rem] border border-primary-100/70 bg-[linear-gradient(135deg,rgba(255,252,244,.98),rgba(246,251,245,.98))] p-5 shadow-[0_18px_45px_rgba(29,52,34,.08)] sm:p-6">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">Trouver un produit</p>
					<h2 className="mt-2 text-2xl font-semibold text-secondary-900">Recherche, filtres et tri</h2>
					<p className="mt-2 text-sm text-secondary-600">
						{total} produit{total > 1 ? 's' : ''} correspondent a la recherche actuelle.
					</p>
				</div>
				<button
					type="button"
					onClick={onReset}
					className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 px-5 text-sm font-semibold text-secondary-700 transition hover:border-primary-300 hover:bg-white"
				>
					Reinitialiser
				</button>
			</div>

			<div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
				<label className="block">
					<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-secondary-600">Recherche</span>
					<input
						type="search"
						value={searchValue}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder="Produit, type, entreprise..."
						className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm text-secondary-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
					/>
				</label>

				<label className="block">
					<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-secondary-600">Tri</span>
					<select
						value={filters.sort}
						onChange={(event) => onFieldChange('sort', event.target.value)}
						className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm text-secondary-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
					>
						{SORT_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>{option.label}</option>
						))}
					</select>
				</label>

				<label className="block">
					<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-secondary-600">Bio</span>
					<select
						value={filters.bio}
						onChange={(event) => onFieldChange('bio', event.target.value)}
						className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm text-secondary-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
					>
						{BIO_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>{option.label}</option>
						))}
					</select>
				</label>

				<label className="block">
					<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-secondary-600">Prix min</span>
					<input
						type="number"
						min="0"
						step="0.01"
						value={filters.prixMin}
						onChange={(event) => onFieldChange('prixMin', event.target.value)}
						placeholder="0"
						className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm text-secondary-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
					/>
				</label>

				<label className="block">
					<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-secondary-600">Prix max</span>
					<input
						type="number"
						min="0"
						step="0.01"
						value={filters.prixMax}
						onChange={(event) => onFieldChange('prixMax', event.target.value)}
						placeholder="50"
						className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm text-secondary-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
					/>
				</label>
			</div>

			<div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex flex-wrap gap-2">
					{availableNatures.map((nature) => {
						const active = filters.natures.includes(nature);
						return (
							<button
								key={nature}
								type="button"
								onClick={() => onToggleNature(nature)}
								className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
									active
										? 'bg-primary-700 text-white shadow-[0_10px_20px_rgba(94,126,71,.24)]'
										: 'border border-neutral-300 bg-white text-secondary-700 hover:border-primary-300 hover:text-primary-800'
								}`}
							>
								{nature}
							</button>
						);
					})}
				</div>

				<label className="inline-flex items-center gap-3 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-secondary-700">
					<input
						type="checkbox"
						checked={filters.enStock}
						onChange={(event) => onFieldChange('enStock', event.target.checked)}
						className="h-4 w-4 accent-primary-700"
					/>
					Produits en stock
				</label>
			</div>

			{hasActiveFilters || proximityFallback ? (
				<div className="mt-5 flex flex-wrap gap-2 text-sm">
					{hasActiveFilters ? (
						<span className="rounded-full bg-secondary-900 px-3 py-1.5 font-semibold text-white">
							Filtres actifs
						</span>
					) : null}
					{proximityFallback ? (
						<span className="rounded-full bg-amber-100 px-3 py-1.5 font-semibold text-amber-900">
							Tri proximite indisponible, ordre alphabetique applique
						</span>
					) : null}
				</div>
			) : null}
		</section>
	);
}
