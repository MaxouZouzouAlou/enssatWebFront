export default function ProfessionalCompanySwitcher({
	companies = [],
	selectedCompanyId,
	onSelectCompany,
	className = '',
	title = 'Entreprise active'
}) {
	if (!Array.isArray(companies) || companies.length === 0) return null;

	return (
		<div className={`rounded-2xl border border-neutral-200 bg-neutral-50 p-4 ${className}`.trim()}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{title}</p>
				<p className="text-xs font-semibold text-secondary-700">
					{companies.length} entreprise{companies.length > 1 ? 's' : ''} rattachee{companies.length > 1 ? 's' : ''}
				</p>
			</div>
			<label className="mt-2 block">
				<span className="sr-only">Choisir une entreprise</span>
				<select
					className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium text-secondary-800 shadow-sm focus:border-primary-500 focus:outline-none"
					onChange={(event) => onSelectCompany?.(event.target.value)}
					value={selectedCompanyId != null ? String(selectedCompanyId) : ''}
				>
					{companies.map((company) => (
						<option key={company.id} value={String(company.id)}>
							{company.nom} · SIRET {company.siret}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}