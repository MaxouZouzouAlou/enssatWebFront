import { useState } from 'react';
import Alert from '../components/Alert.jsx';
import { ActionButton } from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SoftPanel from '../components/layout/SoftPanel.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { API_BASE_URL, authClient } from '../services/auth-client';
import { useToast } from '../app/ToastProvider.jsx';

async function updateProfile(fields) {
	const response = await fetch(`${API_BASE_URL}/api/auth/update-user`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(fields)
	});
	const data = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(data.message || data.error || 'Mise à jour impossible.');
	return data;
}

function ProfileSection({ user, profile, onSaved }) {
	const toast = useToast();
	const nom = profile?.user?.nom || user?.lastName || '';
	const prenom = profile?.user?.prenom || user?.firstName || '';
	const [form, setForm] = useState({ nom, prenom });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

	const submit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			await updateProfile({ firstName: form.prenom, lastName: form.nom, name: `${form.prenom} ${form.nom}`.trim() });
			setSuccess('Profil mis à jour.');
			toast.showSuccess('Profil mis à jour.');
			onSaved?.();
		} catch (err) {
			setError(err.message);
			toast.showError(err.message || 'Mise à jour impossible.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<SoftPanel className="p-5">
			<p className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Informations personnelles</p>
			{error ? <Alert className="mb-3">{error}</Alert> : null}
			{success ? <Alert type="success" className="mb-3">{success}</Alert> : null}
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
				<FormField label="Prénom" name="prenom" value={form.prenom} onChange={update('prenom')} required />
				<FormField label="Nom" name="nom" value={form.nom} onChange={update('nom')} required />
				<div className="sm:col-span-2">
					<ActionButton type="submit" loading={loading} className="h-10">
						Enregistrer
					</ActionButton>
				</div>
			</form>
		</SoftPanel>
	);
}

function PasswordSection() {
	const toast = useToast();
	const [form, setForm] = useState({ current: '', next: '', confirm: '' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

	const submit = async (e) => {
		e.preventDefault();
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
			if (authError) throw new Error(authError.message || 'Mot de passe actuel incorrect.');
			setSuccess('Mot de passe mis à jour.');
			toast.showSuccess('Mot de passe mis à jour.');
			setForm({ current: '', next: '', confirm: '' });
		} catch (err) {
			setError(err.message);
			toast.showError(err.message || 'Mot de passe actuel incorrect.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<SoftPanel className="p-5">
			<p className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Changer le mot de passe</p>
			{error ? <Alert className="mb-3">{error}</Alert> : null}
			{success ? <Alert type="success" className="mb-3">{success}</Alert> : null}
			<form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
				<div className="sm:col-span-2">
					<FormField label="Mot de passe actuel" name="current" type="password" toggleVisibility value={form.current} onChange={update('current')} required autoComplete="current-password" />
				</div>
				<FormField label="Nouveau mot de passe" name="next" type="password" toggleVisibility value={form.next} onChange={update('next')} required autoComplete="new-password" />
				<FormField label="Confirmer" name="confirm" type="password" toggleVisibility value={form.confirm} onChange={update('confirm')} required autoComplete="new-password" />
				<div className="sm:col-span-2">
					<ActionButton type="submit" loading={loading} className="h-10">
						Mettre à jour
					</ActionButton>
				</div>
			</form>
		</SoftPanel>
	);
}

export default function SettingsPage({ profile, user, onSaved }) {
	return (
		<PageShell contentClassName="max-w-3xl">
			<SectionHeader eyebrow="Paramètres" title="Mon compte">
				<p>Modifiez vos informations personnelles et votre mot de passe.</p>
			</SectionHeader>

			<SurfaceCard className="mt-8 space-y-4 p-5 sm:p-8">
				<ProfileSection user={user} profile={profile} onSaved={onSaved} />
				<PasswordSection />
			</SurfaceCard>
		</PageShell>
	);
}
