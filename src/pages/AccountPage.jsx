import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import AddressAutocompleteInput from '../features/address/AddressAutocompleteInput.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SoftPanel from '../components/layout/SoftPanel.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { authClient, deletePersonalAccount, requestEmailChange, updatePersonalProfile } from '../services/auth-client.js';

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
			return;
		}

		if (form.next !== form.confirm) {
			setError('Les mots de passe ne correspondent pas.');
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
			setForm({ current: '', next: '', confirm: '' });
		} catch (submitError) {
			setError(submitError.message || 'Impossible de mettre à jour le mot de passe.');
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

function EmailChangePanel({ currentEmail, onEmailChangeRequested }) {
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
			setSuccess(result.message || 'Un email de verification a ete envoye a votre nouvelle adresse.');
			setNewEmail('');
			await onEmailChangeRequested?.();
		} catch (submitError) {
			setError(submitError.message || "Impossible d'initialiser le changement d'email.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<SoftPanel className="mt-6 p-5">
			<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Email</p>
			<h3 className="mt-2 text-xl font-semibold text-secondary-900">Changer d'adresse email</h3>
			<p className="mt-2 text-sm text-secondary-600">
				L'email n'est pas modifie immediatement. Un lien de verification est envoye a la nouvelle adresse avant toute mise a jour.
			</p>
			<div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
				<p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Adresse actuelle</p>
				<p className="mt-1 text-sm font-medium text-secondary-800">{currentEmail || 'Non renseigne'}</p>
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
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState('');
	const [saveSuccess, setSaveSuccess] = useState('');
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState('');
	const [showDeleteModal, setShowDeleteModal] = useState(false);

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
		} catch (error) {
			setSaveError(error.message || 'Impossible de mettre à jour le profil.');
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
			navigate('/', { replace: true });
		} catch (error) {
			setDeleteError(error.message || 'Impossible de supprimer le compte.');
		} finally {
			setDeleting(false);
			setShowDeleteModal(false);
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
						<p className="mt-1 text-xs text-neutral-600">Cliquez sur une entreprise pour ouvrir son dashboard.</p>
						<div className="mt-3 grid gap-3 sm:grid-cols-2">
							{professionalCompanies.map((company) => (
								<button
									type="button"
									key={company.id}
									onClick={() => openCompanyDashboard(company.id)}
									className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-left hover:border-primary-300 hover:bg-primary-50"
								>
									<p className="text-sm font-semibold text-secondary-900">{company.nom}</p>
									<p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">SIRET {company.siret}</p>
									<p className="mt-2 text-sm text-neutral-600">{company.adresse_ligne}</p>
									<p className="text-sm text-neutral-600">
										{company.code_postal} {company.ville}
									</p>
								</button>
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
		</PageShell>
	);
}
