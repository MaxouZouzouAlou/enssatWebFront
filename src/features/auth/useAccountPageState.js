import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
	createProfessionalCompany,
	deletePersonalAccount,
	deleteProfessionalCompany,
	updatePersonalProfile
} from '../../services/auth-client.js';
import { useToast } from '../../app/ToastProvider.jsx';

function buildProfileForm(profile, user, profileData) {
	return {
		nom: profile?.user?.nom || '',
		prenom: profile?.user?.prenom || '',
		email: profile?.user?.email || user?.email || '',
		num_telephone: profileData?.num_telephone || '',
		adresse_ligne: profileData?.adresse_ligne || '',
		code_postal: profileData?.code_postal || '',
		ville: profileData?.ville || ''
	};
}

const emptyCompanyForm = {
	nom: '',
	siret: '',
	adresse_ligne: '',
	code_postal: '',
	ville: ''
};

export default function useAccountPageState({
	profile,
	user,
	signOut,
	onProfileRefresh,
	onSelectProfessionalCompany
}) {
	const navigate = useNavigate();
	const toast = useToast();
	const profileData = useMemo(
		() => (profile?.particulier || profile?.client || profile?.professionnel || {}),
		[profile]
	);
	const initialProfileForm = useMemo(
		() => buildProfileForm(profile, user, profileData),
		[profile, profileData, user]
	);

	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState('');
	const [saveSuccess, setSaveSuccess] = useState('');
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState('');
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
	const [companyError, setCompanyError] = useState('');
	const [companySuccess, setCompanySuccess] = useState('');
	const [companySaving, setCompanySaving] = useState(false);
	const [companyDeleting, setCompanyDeleting] = useState(false);
	const [companyToDelete, setCompanyToDelete] = useState(null);
	const [form, setForm] = useState(initialProfileForm);

	useEffect(() => {
		setForm(initialProfileForm);
	}, [initialProfileForm]);

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

	const onCompanyAddressChange = (nextValue) => {
		setCompanyForm((current) => ({ ...current, adresse_ligne: nextValue }));
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
		setForm(initialProfileForm);
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
			setCompanyForm(emptyCompanyForm);
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

	return {
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
	};
}
