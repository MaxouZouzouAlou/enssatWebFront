import ProfessionalDashboard from '../features/dashboard/ProfessionalDashboard.jsx';

export default function ProfessionalDashboardPage({
	accountType,
	professionalId,
	professionalCompanies,
	selectedCompany,
	onSelectCompany
}) {
	return (
		<ProfessionalDashboard
			accountType={accountType}
			professionalId={professionalId}
			professionalCompanies={professionalCompanies}
			selectedCompany={selectedCompany}
			onSelectCompany={onSelectCompany}
		/>
	);
}
