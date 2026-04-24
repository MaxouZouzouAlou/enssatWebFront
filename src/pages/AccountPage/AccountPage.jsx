import useAccountPageState from '../../features/auth/useAccountPageState.js';
import { ActionButton } from '../../components/Button.jsx';
import {
	DeleteAccountModal,
	EmailChangePanel,
	formatAddress,
	PasswordBlock
} from '../../features/auth/AccountPageSections.jsx';
import PersonalProfilePanel from '../../features/auth/PersonalProfilePanel.jsx';
import ProfessionalCompaniesPanel from '../../features/auth/ProfessionalCompaniesPanel.jsx';
import PageShell from '../../components/layout/PageShell.jsx';
import SectionHeader from '../../components/layout/SectionHeader.jsx';
import SoftPanel from '../../components/layout/SoftPanel.jsx';
import SurfaceCard from '../../components/layout/SurfaceCard.jsx';

export default function AccountPage({
	isProfessional = false,
	profile,
	profileState,
	signOut,
	user,
	professionalCompanies = [],
	onSelectProfessionalCompany,
	onProfileRefresh
}) {
	const {
		profileData,
		editing,
		setEditing,
		saving,
		saveError,
		saveSuccess,
		deleting,
		deleteError,
		showDeleteModal,
		setShowDeleteModal,
		companyForm,
		companyError,
		companySuccess,
		companySaving,
		companyDeleting,
		companyToDelete,
		setCompanyToDelete,
		form,
		setForm,
		onFieldChange,
		onSelectSuggestedAddress,
		onCompanyFieldChange,
		onCompanyAddressChange,
		onSelectSuggestedCompanyAddress,
		onSaveProfile,
		onCancelEdit,
		openCompanyDashboard,
		onDeleteAccount,
		onCreateCompany,
		onDeleteCompany
	} = useAccountPageState({
		profile,
		user,
		signOut,
		onProfileRefresh,
		onSelectProfessionalCompany
	});

	return (
		<PageShell contentClassName="max-w-5xl">
			<SectionHeader eyebrow="Compte" title="Mon compte">
				<p>Consultez et modifiez directement vos informations personnelles.</p>
			</SectionHeader>

			<SurfaceCard className="mt-8 p-5 sm:p-8">
				<SoftPanel className="p-5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Informations de compte</p>
							<h2 className="mt-2 text-2xl font-semibold text-secondary-900">{user.name}</h2>
							<p className="mt-1 text-sm text-secondary-600">{user.email}</p>
						</div>
						<div className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-secondary-700">
							{profile?.accountType || 'Non renseigné'}
						</div>
					</div>

					<div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						<div className="rounded-2xl border border-neutral-200 bg-white p-4">
							<p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Email vérifié</p>
							<p className="mt-2 text-lg font-semibold text-secondary-900">{user.emailVerified ? 'Oui' : 'Non'}</p>
						</div>
						{!isProfessional ? (
							<div className="rounded-2xl border border-neutral-200 bg-white p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Fidélité</p>
								<p className="mt-2 text-lg font-semibold text-secondary-900">{profile?.particulier?.pointsFidelite ?? 0} points</p>
							</div>
						) : null}
						<div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:col-span-2">
							<p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Adresse enregistrée</p>
							<p className="mt-2 text-sm font-semibold text-secondary-900">{formatAddress(profileData) || 'Aucune adresse personnelle'}</p>
						</div>
					</div>
				</SoftPanel>

				{profileState.loading ? <p className="mt-6 text-sm text-neutral-600">Chargement du profil...</p> : null}
				{profileState.error ? <p className="mt-6 text-sm text-red-700">{profileState.error}</p> : null}

				<PersonalProfilePanel
					editing={editing}
					setEditing={setEditing}
					saving={saving}
					saveError={saveError}
					saveSuccess={saveSuccess}
					form={form}
					setForm={setForm}
					onFieldChange={onFieldChange}
					onSelectSuggestedAddress={onSelectSuggestedAddress}
					onSaveProfile={onSaveProfile}
					onCancelEdit={onCancelEdit}
				/>

				<EmailChangePanel currentEmail={form.email} onEmailChangeRequested={onProfileRefresh} />

				<PasswordBlock />

				{profile?.professionnel ? (
					<ProfessionalCompaniesPanel
						companyForm={companyForm}
						companyError={companyError}
						companySuccess={companySuccess}
						companySaving={companySaving}
						companyDeleting={companyDeleting}
						companyToDelete={companyToDelete}
						setCompanyToDelete={setCompanyToDelete}
						professionalCompanies={professionalCompanies}
						onCompanyFieldChange={onCompanyFieldChange}
						onCompanyAddressChange={onCompanyAddressChange}
						onSelectSuggestedCompanyAddress={onSelectSuggestedCompanyAddress}
						onCreateCompany={onCreateCompany}
						openCompanyDashboard={openCompanyDashboard}
						onDeleteCompany={onDeleteCompany}
					/>
				) : null}

				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<ActionButton type="button" onClick={signOut} variant="danger">
						Se déconnecter
					</ActionButton>
					<ActionButton type="button" onClick={() => setShowDeleteModal(true)} variant="danger">
						Supprimer son compte
					</ActionButton>
				</div>

				{deleteError ? <p className="mt-3 text-sm font-semibold text-red-700">{deleteError}</p> : null}
			</SurfaceCard>

			<DeleteAccountModal
				open={showDeleteModal}
				loading={deleting}
				onCancel={() => setShowDeleteModal(false)}
				onConfirm={onDeleteAccount}
			/>
		</PageShell>
	);
}
