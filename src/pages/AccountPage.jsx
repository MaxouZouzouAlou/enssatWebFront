import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import AddressAutocompleteInput from '../features/address/AddressAutocompleteInput.jsx';
import {
	DeleteAccountModal,
	DeleteCompanyModal,
	EditableField,
	EmailChangePanel,
	formatAddress,
	PasswordBlock
} from '../features/auth/AccountPageSections.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SoftPanel from '../components/layout/SoftPanel.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import {
	createProfessionalCompany,
	deletePersonalAccount,
	deleteProfessionalCompany,
	updatePersonalProfile
} from '../services/auth-client.js';
import { useToast } from '../app/ToastProvider.jsx';

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
	const navigate = useNavigate();
	const toast = useToast();
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState('');
	const [saveSuccess, setSaveSuccess] = useState('');
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState('');
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [companyForm, setCompanyForm] = useState({
		nom: '',
		siret: '',
		adresse_ligne: '',
		code_postal: '',
		ville: ''
	});
	const [companyError, setCompanyError] = useState('');
	const [companySuccess, setCompanySuccess] = useState('');
	const [companySaving, setCompanySaving] = useState(false);
	const [companyDeleting, setCompanyDeleting] = useState(false);
	const [companyToDelete, setCompanyToDelete] = useState(null);

	const profileData = useMemo(
		() => (profile?.particulier || profile?.client || profile?.professionnel || {}),
		[profile]
	);

	const [form, setForm] = useState({
		nom: profile?.user?.nom || '',
		prenom: profile?.user?.prenom || '',
		email: profile?.user?.email || user?.email || '',
		num_telephone: profileData?.num_telephone || '',
		adresse_ligne: profileData?.adresse_ligne || '',
		code_postal: profileData?.code_postal || '',
		ville: profileData?.ville || ''
	});

	useEffect(() => {
		setForm({
			nom: profile?.user?.nom || '',
			prenom: profile?.user?.prenom || '',
			email: profile?.user?.email || user?.email || '',
			num_telephone: profileData?.num_telephone || '',
			adresse_ligne: profileData?.adresse_ligne || '',
			code_postal: profileData?.code_postal || '',
			ville: profileData?.ville || ''
		});
	}, [profile?.user?.nom, profile?.user?.prenom, profile?.user?.email, profileData?.num_telephone, profileData?.adresse_ligne, profileData?.code_postal, profileData?.ville, user?.email]);

	const onFieldChange = (event) => {
		const { name, value } = event.target;
		setForm((current) => ({ ...current, [name]: value }));
	};

	const onSelectSuggestedAddress = (suggestion) => {
		setForm((current) => ({
			...current,
			adresse_ligne: suggestion.adresse_ligne,
			code_postal: suggestion.code_postal,
			ville: suggestion.ville
		}));
	};

	const onCompanyFieldChange = (event) => {
		const { name, value } = event.target;
		setCompanyForm((current) => ({ ...current, [name]: value }));
	};

	const onSelectSuggestedCompanyAddress = (suggestion) => {
		setCompanyForm((current) => ({
			...current,
			adresse_ligne: suggestion.adresse_ligne,
			code_postal: suggestion.code_postal,
			ville: suggestion.ville
		}));
	};

	const onSaveProfile = async () => {
		setSaving(true);
		setSaveError('');
		setSaveSuccess('');
		try {
			await updatePersonalProfile({
				nom: form.nom,
				prenom: form.prenom,
				num_telephone: form.num_telephone,
				adresse_ligne: form.adresse_ligne,
				code_postal: form.code_postal,
				ville: form.ville
			});
			await onProfileRefresh?.();
			setEditing(false);
			setSaveSuccess('Profil mis à jour.');
			toast.showSuccess('Profil mis à jour.');
		} catch (error) {
			const message = error.message || 'Impossible de mettre à jour le profil.';
			setSaveError(message);
			toast.showError(message);
		} finally {
			setSaving(false);
		}
	};

	const onCancelEdit = () => {
		setEditing(false);
		setSaveError('');
		setSaveSuccess('');
		setForm({
			nom: profile?.user?.nom || '',
			prenom: profile?.user?.prenom || '',
			email: profile?.user?.email || user?.email || '',
			num_telephone: profileData?.num_telephone || '',
			adresse_ligne: profileData?.adresse_ligne || '',
			code_postal: profileData?.code_postal || '',
			ville: profileData?.ville || ''
		});
	};

	const openCompanyDashboard = (companyId) => {
		onSelectProfessionalCompany?.(String(companyId));
		navigate('/espace-pro');
	};

	const onDeleteAccount = async () => {
		setDeleting(true);
		setDeleteError('');
		try {
			await deletePersonalAccount();
			try {
				await signOut?.();
			} catch {
				// no-op, session can already be invalidated after account deletion
			}
			toast.showSuccess('Compte supprime.');
			navigate('/', { replace: true });
		} catch (error) {
			const message = error.message || 'Impossible de supprimer le compte.';
			setDeleteError(message);
			toast.showError(message);
		} finally {
			setDeleting(false);
			setShowDeleteModal(false);
		}
	};

	const onCreateCompany = async (event) => {
		event.preventDefault();
		setCompanySaving(true);
		setCompanyError('');
		setCompanySuccess('');

		try {
			await createProfessionalCompany(companyForm);
			await onProfileRefresh?.();
			setCompanyForm({
				nom: '',
				siret: '',
				adresse_ligne: '',
				code_postal: '',
				ville: ''
			});
			setCompanySuccess('Entreprise créée et rattachée à votre compte.');
			toast.showSuccess('Entreprise créée et rattachée à votre compte.');
		} catch (error) {
			const message = error.message || "Impossible de créer l'entreprise.";
			setCompanyError(message);
			toast.showError(message);
		} finally {
			setCompanySaving(false);
		}
	};

	const onDeleteCompany = async () => {
		if (!companyToDelete) return;
		setCompanyDeleting(true);
		setCompanyError('');
		setCompanySuccess('');

		try {
			await deleteProfessionalCompany(companyToDelete.id);
			await onProfileRefresh?.();
			setCompanySuccess('Entreprise supprimee.');
			toast.showSuccess('Entreprise supprimee.');
		} catch (error) {
			const message = error.message || "Impossible de supprimer l'entreprise.";
			setCompanyError(message);
			toast.showError(message);
		} finally {
			setCompanyDeleting(false);
			setCompanyToDelete(null);
		}
	};

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

				<EmailChangePanel currentEmail={form.email} onEmailChangeRequested={onProfileRefresh} />

				<PasswordBlock />

				{profile?.professionnel ? (
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
								<label className="block text-sm font-semibold text-secondary-900 sm:col-span-3">
									Adresse de l'entreprise
									<AddressAutocompleteInput
										value={companyForm.adresse_ligne}
										onAddressChange={(nextValue) => setCompanyForm((current) => ({ ...current, adresse_ligne: nextValue }))}
										onSuggestionSelect={onSelectSuggestedCompanyAddress}
										className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
										placeholder="12 rue des Producteurs"
									/>
								</label>
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
								<div
									key={company.id}
									className="rounded-xl border border-neutral-200 bg-white p-3"
								>
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
			<DeleteCompanyModal
				company={companyToDelete}
				loading={companyDeleting}
				onCancel={() => setCompanyToDelete(null)}
				onConfirm={onDeleteCompany}
			/>
		</PageShell>
	);
}
