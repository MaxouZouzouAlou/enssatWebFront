import { ActionButton } from '../../components/Button.jsx';
import AddressAutocompleteInput from '../address/AddressAutocompleteInput.jsx';
import SoftPanel from '../../components/layout/SoftPanel.jsx';
import { DeleteCompanyModal } from './AccountPageSections.jsx';

export default function ProfessionalCompaniesPanel({
	companyForm,
	companyError,
	companySuccess,
	companySaving,
	companyDeleting,
	companyToDelete,
	setCompanyToDelete,
	professionalCompanies,
	onCompanyFieldChange,
	onCompanyAddressChange,
	onSelectSuggestedCompanyAddress,
	onCreateCompany,
	openCompanyDashboard,
	onDeleteCompany
}) {
	return (
		<>
			<SoftPanel className="mt-6 p-5">
				<p className="text-sm font-semibold text-secondary-900">Toutes vos entreprises</p>
				<p className="mt-1 text-xs text-neutral-600">Ouvrez le dashboard d'une entreprise, ajoutez-en une nouvelle ou supprimez une entreprise vide.</p>
				{companyError ? <p className="mt-4 text-sm font-semibold text-red-700">{companyError}</p> : null}
				{companySuccess ? <p className="mt-4 text-sm font-semibold text-primary-700">{companySuccess}</p> : null}
				<form className="mt-4 grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4" onSubmit={onCreateCompany}>
					<div className="grid gap-4 sm:grid-cols-3">
						<label className="block text-sm font-semibold text-secondary-900 sm:col-span-2">
							Nom de l'entreprise
							<input
								name="nom"
								value={companyForm.nom}
								onChange={onCompanyFieldChange}
								className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
								required
							/>
						</label>
						<label className="block text-sm font-semibold text-secondary-900">
							SIRET
							<input
								name="siret"
								value={companyForm.siret}
								onChange={onCompanyFieldChange}
								inputMode="numeric"
								maxLength={14}
								pattern="[0-9]{14}"
								className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
								required
							/>
						</label>
						<div className="sm:col-span-3">
							<label className="block text-sm font-semibold text-secondary-900" htmlFor="company-address-line">
								Adresse de l'entreprise
							</label>
							<AddressAutocompleteInput
								id="company-address-line"
								value={companyForm.adresse_ligne}
								onAddressChange={onCompanyAddressChange}
								onSuggestionSelect={onSelectSuggestedCompanyAddress}
								className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
								placeholder="12 rue des Producteurs"
							/>
						</div>
						<label className="block text-sm font-semibold text-secondary-900">
							Code postal
							<input
								name="code_postal"
								value={companyForm.code_postal}
								onChange={onCompanyFieldChange}
								inputMode="numeric"
								maxLength={5}
								pattern="[0-9]{5}"
								className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
								required
							/>
						</label>
						<label className="block text-sm font-semibold text-secondary-900 sm:col-span-2">
							Ville
							<input
								name="ville"
								value={companyForm.ville}
								onChange={onCompanyFieldChange}
								className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
								required
							/>
						</label>
					</div>
					<div className="flex justify-end">
						<ActionButton type="submit" loading={companySaving} className="h-10">
							Ajouter une entreprise
						</ActionButton>
					</div>
				</form>
				<div className="mt-3 grid gap-3 sm:grid-cols-2">
					{professionalCompanies.map((company) => (
						<div key={company.id} className="rounded-xl border border-neutral-200 bg-white p-3">
							<p className="text-sm font-semibold text-secondary-900">{company.nom}</p>
							<p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">SIRET {company.siret}</p>
							<p className="mt-2 text-sm text-neutral-600">{company.adresse_ligne}</p>
							<p className="text-sm text-neutral-600">
								{company.code_postal} {company.ville}
							</p>
							<div className="mt-3 flex gap-2">
								<ActionButton type="button" className="h-10" onClick={() => openCompanyDashboard(company.id)}>
									Ouvrir le dashboard
								</ActionButton>
								<ActionButton
									type="button"
									variant="danger"
									className="h-10"
									onClick={() => setCompanyToDelete(company)}
								>
									Supprimer cette entreprise
								</ActionButton>
							</div>
						</div>
					))}
				</div>
			</SoftPanel>

			<DeleteCompanyModal
				company={companyToDelete}
				loading={companyDeleting}
				onCancel={() => setCompanyToDelete(null)}
				onConfirm={onDeleteCompany}
			/>
		</>
	);
}
