import FormField from '../../components/FormField.jsx';
import SoftPanel from '../../components/layout/SoftPanel.jsx';

export default function ProfessionalCompanyFields({ entreprise, fieldErrors, onChange }) {
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
				<FormField
					className="sm:col-span-3"
					error={fieldErrors['entreprise.adresse_ligne']}
					label="Adresse de l'entreprise"
					name="entreprise.adresse_ligne"
					onChange={onChange('adresse_ligne')}
					required
					value={entreprise.adresse_ligne}
				/>
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
