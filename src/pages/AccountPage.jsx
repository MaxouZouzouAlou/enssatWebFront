import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SoftPanel from '../components/layout/SoftPanel.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { updatePersonalAddress } from '../services/auth-client.js';

function formatAddress(profile) {
	const address = profile?.particulier || profile?.client || null;
	if (!address) return '';
	return [address.adresse_ligne, address.code_postal, address.ville].filter(Boolean).join(', ');
}

function AddressPanel({ profile, onProfileRefresh }) {
	const [form, setForm] = useState({
		adresse_ligne: profile?.particulier?.adresse_ligne || '',
		code_postal: profile?.particulier?.code_postal || '',
		ville: profile?.particulier?.ville || ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		setForm({
			adresse_ligne: profile?.particulier?.adresse_ligne || '',
			code_postal: profile?.particulier?.code_postal || '',
			ville: profile?.particulier?.ville || ''
		});
	}, [profile?.particulier?.adresse_ligne, profile?.particulier?.code_postal, profile?.particulier?.ville]);

	const updateField = (field) => (event) => {
		setForm((current) => ({ ...current, [field]: event.target.value }));
	};

	const submit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			await updatePersonalAddress(form);
			await onProfileRefresh?.();
			setSuccess('Adresse personnelle mise à jour.');
		} catch (submitError) {
			setError(submitError.message || 'Impossible de mettre à jour l adresse.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<SoftPanel className="p-5">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Livraison à domicile</p>
					<h3 className="mt-2 text-lg font-semibold text-secondary-900">Adresse personnelle</h3>
					<p className="mt-1 text-sm text-secondary-600">
						Cette adresse sera utilisée automatiquement si vous choisissez la livraison à domicile pendant le checkout.
					</p>
				</div>
				<div className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-secondary-700">
					{formatAddress(profile) ? 'Adresse enregistrée' : 'Adresse manquante'}
				</div>
			</div>

			{error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
			{success ? <p className="mt-4 text-sm font-semibold text-primary-700">{success}</p> : null}

			<form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
				<label className="block text-sm font-semibold text-secondary-900 sm:col-span-2">
					Adresse
					<input
						value={form.adresse_ligne}
						onChange={updateField('adresse_ligne')}
						className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
						placeholder="12 rue des Producteurs"
					/>
				</label>
				<label className="block text-sm font-semibold text-secondary-900">
					Code postal
					<input
						value={form.code_postal}
						onChange={updateField('code_postal')}
						className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
						placeholder="22300"
					/>
				</label>
				<label className="block text-sm font-semibold text-secondary-900">
					Ville
					<input
						value={form.ville}
						onChange={updateField('ville')}
						className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
						placeholder="Lannion"
					/>
				</label>
				<div className="sm:col-span-2">
					<ActionButton type="submit" loading={loading} className="h-10">
						Enregistrer mon adresse
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
	onProfileRefresh
}) {
	const navigate = useNavigate();

	return (
		<PageShell contentClassName="max-w-5xl">
			<SectionHeader eyebrow="Compte" title="Mon compte">
				<p>Gérez vos informations utiles pour les commandes, la livraison et vos accès.</p>
			</SectionHeader>

			<SurfaceCard className="mt-8 p-5 sm:p-8">
				<div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
					<SoftPanel className="p-5">
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Profil</p>
						<h2 className="mt-2 text-2xl font-semibold text-secondary-900">{user.name}</h2>
						<p className="mt-1 text-sm text-secondary-600">{user.email}</p>
						<div className="mt-5 grid gap-3 sm:grid-cols-2">
							<div className="rounded-2xl border border-neutral-200 bg-white p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Type de compte</p>
								<p className="mt-2 text-lg font-semibold text-secondary-900">{profile?.accountType || 'Non renseigné'}</p>
							</div>
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
							<div className="rounded-2xl border border-neutral-200 bg-white p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Adresse enregistrée</p>
								<p className="mt-2 text-sm font-semibold text-secondary-900">{formatAddress(profile) || 'Aucune adresse personnelle'}</p>
							</div>
						</div>
					</SoftPanel>

					<SoftPanel className="p-5">
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Raccourcis</p>
						<div className="mt-4 grid gap-3">
							<ActionButton type="button" variant="secondary" onClick={() => navigate('/commandes')} className="justify-start">
								Historique des commandes
							</ActionButton>
							{!isProfessional ? (
								<ActionButton type="button" variant="secondary" onClick={() => navigate('/fidelite')} className="justify-start">
									Fidélité
								</ActionButton>
							) : null}
							<ActionButton type="button" variant="secondary" onClick={() => navigate('/parametres')} className="justify-start">
								Paramètres du compte
							</ActionButton>
							<ActionButton type="button" variant="light" onClick={signOut} className="justify-start">
								Se déconnecter
							</ActionButton>
						</div>
					</SoftPanel>
				</div>

				{profileState.loading ? <p className="mt-6 text-sm text-neutral-600">Chargement du profil...</p> : null}
				{profileState.error ? <p className="mt-6 text-sm text-red-700">{profileState.error}</p> : null}

				{!isProfessional ? (
					<div className="mt-6">
						<AddressPanel profile={profile} onProfileRefresh={onProfileRefresh} />
					</div>
				) : null}

				{profile?.professionnel ? (
					<SoftPanel className="mt-6 p-5">
						<p className="text-sm font-semibold text-secondary-900">Toutes vos entreprises</p>
						<div className="mt-3 grid gap-3 sm:grid-cols-2">
							{professionalCompanies.map((company) => (
								<div key={company.id} className="rounded-xl border border-neutral-200 bg-white p-3">
									<p className="text-sm font-semibold text-secondary-900">{company.nom}</p>
									<p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">SIRET {company.siret}</p>
									<p className="mt-2 text-sm text-neutral-600">{company.adresse_ligne}</p>
									<p className="text-sm text-neutral-600">
										{company.code_postal} {company.ville}
									</p>
								</div>
							))}
						</div>
					</SoftPanel>
				) : null}
			</SurfaceCard>
		</PageShell>
	);
}
