export default function ProfessionalCompanySwitcher({
	companies = [],
	selectedCompanyId,
	onSelectCompany,
	className = '',
	title = 'Entreprise active'
}) {
	if (!Array.isArray(companies) || companies.length === 0) return null;

	const activeCompany =
		companies.find((company) => String(company.id) === String(selectedCompanyId)) ||
		companies[0] ||
		null;

	return (
		<div
			className={`rounded-[1.75rem] border border-white/70 bg-white/85 p-4 shadow-[0_20px_45px_rgba(32,52,38,.10)] backdrop-blur ${className}`.trim()}
		>
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary-500">{title}</p>
						<p className="mt-2 text-lg font-bold text-secondary-900">{activeCompany?.nom}</p>
						{activeCompany ? (
							<p className="mt-1 text-sm text-secondary-600">
								SIRET {activeCompany.siret} · {activeCompany.ville}
							</p>
						) : null}
					</div>
					<span className="inline-flex rounded-full bg-secondary-100 px-3 py-1 text-xs font-bold text-secondary-700">
						{companies.length} entreprise{companies.length > 1 ? 's' : ''}
					</span>
				</div>

				<label className="block">
					<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-secondary-500">
						Changer de vue
					</span>
					<select
						className="h-12 w-full rounded-2xl border border-secondary-200 bg-[linear-gradient(180deg,#ffffff_0%,#f5f7f2_100%)] px-4 text-sm font-semibold text-secondary-900 shadow-inner focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
						onChange={(event) => onSelectCompany?.(event.target.value)}
						value={selectedCompanyId != null ? String(selectedCompanyId) : ''}
					>
						{companies.map((company) => (
							<option key={company.id} value={String(company.id)}>
								{company.nom} · {company.ville}
							</option>
						))}
					</select>
				</label>
			</div>
		</div>
	);
}
