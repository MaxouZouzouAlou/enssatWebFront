import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import AddressAutocompleteInput from '../features/address/AddressAutocompleteInput.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SoftPanel from '../components/layout/SoftPanel.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import {
	authClient,
	createProfessionalCompany,
	deletePersonalAccount,
	deleteProfessionalCompany,
	requestEmailChange,
	updatePersonalProfile
} from '../services/auth-client.js';
import { useToast } from '../app/ToastProvider.jsx';

function formatAddress(data) {
	if (!data) return '';
	return [data.adresse_ligne, data.code_postal, data.ville].filter(Boolean).join(', ');
}

function EditableField({ label, value, name, editing, onChange, placeholder = '', inputRenderer = null }) {
	return (
		<label className="block text-sm font-semibold text-secondary-900">
			{label}
			{editing ? (
				inputRenderer ? (
					inputRenderer()
				) : (
					<input
						name={name}
						value={value}
						onChange={onChange}
						className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
						placeholder={placeholder}
					/>
				)
			) : (
				<p className="mt-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-secondary-800">
					{value || 'Non renseigné'}
				</p>
			)}
		</label>
	);
}

function PasswordBlock() {
	const toast = useToast();
	const [form, setForm] = useState({ current: '', next: '', confirm: '' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [visibility, setVisibility] = useState({ current: false, next: false, confirm: false });

	const update = (field) => (event) => {
		setForm((current) => ({ ...current, [field]: event.target.value }));
	};
	const toggleVisibility = (field) => {
		setVisibility((current) => ({ ...current, [field]: !current[field] }));
	};

	const submit = async (event) => {
		event.preventDefault();
		setError('');
		setSuccess('');

		if (form.next.length < 8) {
			setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
			toast.showError('Le nouveau mot de passe doit contenir au moins 8 caracteres.');
			return;
		}

		if (form.next !== form.confirm) {
			setError('Les mots de passe ne correspondent pas.');
			toast.showError('Les mots de passe ne correspondent pas.');
			return;
		}

		setLoading(true);
		try {
			const { error: authError } = await authClient.changePassword({
				currentPassword: form.current,
				newPassword: form.next,
				revokeOtherSessions: false
			});

			if (authError) {
				throw new Error(authError.message || 'Mot de passe actuel incorrect.');
			}

			setSuccess('Mot de passe mis à jour.');
			toast.showSuccess('Mot de passe mis à jour.');
			setForm({ current: '', next: '', confirm: '' });
		} catch (submitError) {
			const message = submitError.message || 'Impossible de mettre à jour le mot de passe.';
			setError(message);
			toast.showError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SoftPanel className="mt-6 p-5">
			<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Sécurité</p>
			<h3 className="mt-2 text-xl font-semibold text-secondary-900">Modifier le mot de passe</h3>

			{error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
			{success ? <p className="mt-4 text-sm font-semibold text-primary-700">{success}</p> : null}

			<form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
				<label className="block text-sm font-semibold text-secondary-900 sm:col-span-2">
					Mot de passe actuel
					<div className="relative mt-2">
						<input
							type={visibility.current ? 'text' : 'password'}
							autoComplete="current-password"
							value={form.current}
							onChange={update('current')}
							className="hide-password-reveal h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 pr-11 text-sm"
							required
						/>
						<button
							type="button"
							onClick={() => toggleVisibility('current')}
							aria-label={visibility.current ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
							className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-500 hover:text-secondary-800"
						>
							<span aria-hidden="true" className="material-symbols-rounded text-xl">
								{visibility.current ? 'visibility_off' : 'visibility'}
							</span>
						</button>
					</div>
				</label>

				<label className="block text-sm font-semibold text-secondary-900">
					Nouveau mot de passe
					<div className="relative mt-2">
						<input
							type={visibility.next ? 'text' : 'password'}
							autoComplete="new-password"
							value={form.next}
							onChange={update('next')}
							className="hide-password-reveal h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 pr-11 text-sm"
							required
						/>
						<button
							type="button"
							onClick={() => toggleVisibility('next')}
							aria-label={visibility.next ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
							className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-500 hover:text-secondary-800"
						>
							<span aria-hidden="true" className="material-symbols-rounded text-xl">
								{visibility.next ? 'visibility_off' : 'visibility'}
							</span>
						</button>
					</div>
				</label>

				<label className="block text-sm font-semibold text-secondary-900">
					Confirmer le mot de passe
					<div className="relative mt-2">
						<input
							type={visibility.confirm ? 'text' : 'password'}
							autoComplete="new-password"
							value={form.confirm}
							onChange={update('confirm')}
							className="hide-password-reveal h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 pr-11 text-sm"
							required
						/>
						<button
							type="button"
							onClick={() => toggleVisibility('confirm')}
							aria-label={visibility.confirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
							className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-500 hover:text-secondary-800"
						>
							<span aria-hidden="true" className="material-symbols-rounded text-xl">
								{visibility.confirm ? 'visibility_off' : 'visibility'}
							</span>
						</button>
					</div>
				</label>

				<div className="sm:col-span-2">
					<ActionButton type="submit" loading={loading} className="h-10">
						Enregistrer le mot de passe
					</ActionButton>
				</div>
			</form>
		</SoftPanel>
	);
}

function DeleteAccountModal({ open, loading, onCancel, onConfirm }) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
				<h3 className="text-xl font-semibold text-secondary-900">Confirmer la suppression</h3>
				<p className="mt-3 text-sm text-secondary-700">
					Cette action supprimera votre compte. Elle est irréversible.
				</p>
				<div className="mt-6 flex gap-2">
					<ActionButton type="button" variant="light" onClick={onCancel} className="h-10">
						Annuler
					</ActionButton>
					<ActionButton type="button" loading={loading} onClick={onConfirm} variant="danger" className="h-10">
						Supprimer définitivement
					</ActionButton>
				</div>
			</div>
		</div>
	);
}

function DeleteCompanyModal({ company, loading, onCancel, onConfirm }) {
	if (!company) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
				<h3 className="text-xl font-semibold text-secondary-900">Supprimer l'entreprise</h3>
				<p className="mt-3 text-sm text-secondary-700">
					Vous allez supprimer <span className="font-semibold">{company.nom}</span> de votre compte professionnel.
				</p>
				<p className="mt-2 text-sm text-secondary-700">
					Cette suppression est irréversible et supprimera aussi les produits et données rattachés à cette entreprise.
				</p>
				<div className="mt-6 flex gap-2">
					<ActionButton type="button" variant="light" onClick={onCancel} className="h-10">
						Annuler
					</ActionButton>
					<ActionButton type="button" loading={loading} onClick={onConfirm} variant="danger" className="h-10">
						Supprimer l'entreprise
					</ActionButton>
				</div>
			</div>
		</div>
	);
}

function EmailChangePanel({ currentEmail, onEmailChangeRequested }) {
	const toast = useToast();
	const [newEmail, setNewEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const submit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			const result = await requestEmailChange({ newEmail });
			const message = result.message || 'Un email de vérification a été envoyé à votre nouvelle adresse.';
			setSuccess(message);
			toast.showSuccess(message);
			setNewEmail('');
			await onEmailChangeRequested?.();
		} catch (submitError) {
			const message = submitError.message || "Impossible d'initialiser le changement d'email.";
			setError(message);
			toast.showError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SoftPanel className="mt-6 p-5">
			<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Email</p>
			<h3 className="mt-2 text-xl font-semibold text-secondary-900">Changer d'adresse email</h3>
			<p className="mt-2 text-sm text-secondary-600">
				L'email n'est pas modifié immédiatement. Un lien de vérification est envoyé à la nouvelle adresse avant toute mise à jour.
			</p>
			<div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
				<p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Adresse actuelle</p>
				<p className="mt-1 text-sm font-medium text-secondary-800">{currentEmail || 'Non renseigné'}</p>
			</div>
			{error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
			{success ? <p className="mt-4 text-sm font-semibold text-primary-700">{success}</p> : null}
			<form className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={submit}>
				<label className="block text-sm font-semibold text-secondary-900">
					Nouvelle adresse email
					<input
						type="email"
						value={newEmail}
						onChange={(event) => setNewEmail(event.target.value)}
						className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
						placeholder="nouvelle.adresse@email.fr"
						required
					/>
				</label>
				<div className="sm:self-end">
					<ActionButton type="submit" loading={loading} className="h-11">
						Envoyer le mail
					</ActionButton>
				</div>
			</form>
		</SoftPanel>
	);
}

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
