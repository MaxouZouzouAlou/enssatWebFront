import { useState } from 'react';
import { ActionButton } from '../../components/Button.jsx';
import SoftPanel from '../../components/layout/SoftPanel.jsx';
import { authClient, requestEmailChange } from '../../services/auth-client.js';
import { useToast } from '../../app/ToastProvider.jsx';

export function formatAddress(data) {
	if (!data) return '';
	return [data.adresse_ligne, data.code_postal, data.ville].filter(Boolean).join(', ');
}

export function EditableField({ label, value, name, editing, onChange, placeholder = '', inputRenderer = null }) {
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

export function PasswordBlock() {
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

export function DeleteAccountModal({ open, loading, onCancel, onConfirm }) {
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

export function DeleteCompanyModal({ company, loading, onCancel, onConfirm }) {
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

export function EmailChangePanel({ currentEmail, onEmailChangeRequested }) {
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
