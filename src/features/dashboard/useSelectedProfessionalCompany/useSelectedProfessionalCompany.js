import { useEffect, useMemo, useState } from 'react';

export function getProfessionalCompanies(profile) {
	if (!profile?.professionnel) return [];

	if (Array.isArray(profile.professionnel.entreprises) && profile.professionnel.entreprises.length > 0) {
		return profile.professionnel.entreprises;
	}

	if (profile.professionnel.entreprise) {
		return [profile.professionnel.entreprise];
	}

	return [];
}

export default function useSelectedProfessionalCompany({ isProfessional, profile }) {
	const professionalCompanies = useMemo(() => getProfessionalCompanies(profile), [profile]);
	const [selectedProfessionalCompanyId, setSelectedProfessionalCompanyId] = useState(null);

	useEffect(() => {
		if (!isProfessional || !professionalCompanies.length) {
			setSelectedProfessionalCompanyId(null);
			return;
		}

		const companyExists = professionalCompanies.some(
			(company) => String(company.id) === String(selectedProfessionalCompanyId)
		);

		if (!companyExists) {
			setSelectedProfessionalCompanyId(String(professionalCompanies[0].id));
		}
	}, [isProfessional, professionalCompanies, selectedProfessionalCompanyId]);

	const selectedProfessionalCompany = useMemo(() => {
		if (!professionalCompanies.length) return null;

		return (
			professionalCompanies.find((company) => String(company.id) === String(selectedProfessionalCompanyId)) ||
			professionalCompanies[0]
		);
	}, [professionalCompanies, selectedProfessionalCompanyId]);

	return {
		professionalCompanies,
		selectedProfessionalCompany,
		selectedProfessionalCompanyId,
		setSelectedProfessionalCompanyId
	};
}
