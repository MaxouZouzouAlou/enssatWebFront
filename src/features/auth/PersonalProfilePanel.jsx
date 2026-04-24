import { ActionButton } from '../../components/Button.jsx';
import AddressAutocompleteInput from '../address/AddressAutocompleteInput.jsx';
import SoftPanel from '../../components/layout/SoftPanel.jsx';
import { EditableField } from './AccountPageSections.jsx';

export default function PersonalProfilePanel({
	editing,
	setEditing,
	saving,
	saveError,
	saveSuccess,
	form,
	setForm,
	onFieldChange,
	onSelectSuggestedAddress,
	onSaveProfile,
	onCancelEdit
}) {
	return (
		<SoftPanel className="mt-6 p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Informations personnelles</p>
					<h3 className="mt-2 text-xl font-semibold text-secondary-900">Profil détaillé</h3>
				</div>
				<div className="flex gap-2">
					{editing ? (
						<>
							<ActionButton type="button" variant="light" onClick={onCancelEdit} className="h-10">
								Annuler
							</ActionButton>
							<ActionButton type="button" loading={saving} onClick={onSaveProfile} className="h-10">
								Enregistrer
							</ActionButton>
						</>
					) : (
						<ActionButton type="button" onClick={() => setEditing(true)} className="h-10">
							Modifier
						</ActionButton>
					)}
				</div>
			</div>

			{saveError ? <p className="mt-4 text-sm font-semibold text-red-700">{saveError}</p> : null}
			{saveSuccess ? <p className="mt-4 text-sm font-semibold text-primary-700">{saveSuccess}</p> : null}

			<div className="mt-5 grid gap-4 sm:grid-cols-2">
				<EditableField label="Nom" name="nom" value={form.nom} editing={editing} onChange={onFieldChange} />
				<EditableField label="Prénom" name="prenom" value={form.prenom} editing={editing} onChange={onFieldChange} />
				<EditableField label="Email" name="email" value={form.email} editing={false} onChange={onFieldChange} />
				<EditableField label="Téléphone" name="num_telephone" value={form.num_telephone} editing={editing} onChange={onFieldChange} />
				<EditableField
					label="Adresse"
					name="adresse_ligne"
					value={form.adresse_ligne}
					editing={editing}
					onChange={onFieldChange}
					placeholder="12 rue des Producteurs"
					inputRenderer={() => (
						<AddressAutocompleteInput
							value={form.adresse_ligne}
							onAddressChange={(nextValue) => setForm((current) => ({ ...current, adresse_ligne: nextValue }))}
							onSuggestionSelect={onSelectSuggestedAddress}
							className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
							placeholder="12 rue des Producteurs"
						/>
					)}
				/>
				<EditableField label="Code postal" name="code_postal" value={form.code_postal} editing={editing} onChange={onFieldChange} />
				<EditableField label="Ville" name="ville" value={form.ville} editing={editing} onChange={onFieldChange} />
			</div>
		</SoftPanel>
	);
}
