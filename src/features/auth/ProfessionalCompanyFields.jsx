import AddressAutocompleteInput from '../address/AddressAutocompleteInput.jsx';
import FormField from '../../components/FormField.jsx';
import SoftPanel from '../../components/layout/SoftPanel.jsx';

export default function ProfessionalCompanyFields({ entreprise, fieldErrors, onChange }) {
	const selectSuggestedCompanyAddress = (suggestion) => {
		onChange('adresse_ligne')({ target: { value: suggestion.adresse_ligne } });
		onChange('code_postal')({ target: { value: suggestion.code_postal } });
		onChange('ville')({ target: { value: suggestion.ville } });
	};

	return (
			<SoftPanel>
			<h3 className="text-sm font-semibold text-secondary-900">Entreprise</h3>
			<div className="mt-4 grid gap-4 sm:grid-cols-3">
				<FormField
					className="sm:col-span-2"
					error={fieldErrors['entreprise.nom']}
					label="Nom de l'entreprise"
					name="entreprise.nom"
					onChange={onChange('nom')}
					required
					value={entreprise.nom}
				/>
				<FormField
					className="sm:col-span-1"
					error={fieldErrors['entreprise.siret']}
					help="14 chiffres."
					inputMode="numeric"
					label="SIRET"
					maxLength={14}
					name="entreprise.siret"
					onChange={onChange('siret')}
					pattern="[0-9]{14}"
					required
					value={entreprise.siret}
				/>
				<label className="block sm:col-span-3" htmlFor="entreprise.adresse_ligne">
					<span className="mb-2 block px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary-600">Adresse de l'entreprise</span>
					<AddressAutocompleteInput
						id="entreprise.adresse_ligne"
						name="entreprise.adresse_ligne"
						value={entreprise.adresse_ligne}
						onAddressChange={(nextValue) => onChange('adresse_ligne')({ target: { value: nextValue } })}
						onSuggestionSelect={selectSuggestedCompanyAddress}
						error={fieldErrors['entreprise.adresse_ligne']}
						className={`w-full rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-sm text-secondary-900 outline-none transition h-11 ${
							fieldErrors['entreprise.adresse_ligne']
								? 'border-red-300 ring-1 ring-red-200 focus:ring-red-100'
								: 'focus:border-primary-300 focus:bg-neutral-50 focus:ring-2 focus:ring-primary-100'
						}`}
					/>
					{fieldErrors['entreprise.adresse_ligne'] ? <span className="mt-1 block text-sm text-red-700">{fieldErrors['entreprise.adresse_ligne']}</span> : null}
				</label>
				<FormField
					className="sm:col-span-1"
					error={fieldErrors['entreprise.code_postal']}
					inputMode="numeric"
					label="Code postal"
					maxLength={5}
					name="entreprise.code_postal"
					onChange={onChange('code_postal')}
					pattern="[0-9]{5}"
					required
					value={entreprise.code_postal}
				/>
				<FormField
					className="sm:col-span-2"
					error={fieldErrors['entreprise.ville']}
					label="Ville"
					name="entreprise.ville"
					onChange={onChange('ville')}
					required
					value={entreprise.ville}
				/>
			</div>
			</SoftPanel>
		);
}
