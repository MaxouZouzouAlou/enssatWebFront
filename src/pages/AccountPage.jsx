import { useNavigate } from 'react-router';
import { PageShell, SectionHeader, SurfaceCard } from '../components/layout';

export default function AccountPage({ isProfessional = false, profile, profileState, signOut, user }) {
	const navigate = useNavigate();

	return (
		<PageShell contentClassName="max-w-4xl">
			<SectionHeader eyebrow="Compte" title="Espace personnel">
				<p>Consultez votre session, vos accès et les raccourcis utiles selon votre rôle.</p>
			</SectionHeader>

			<SurfaceCard className="mt-8 p-5 sm:p-8">
				<div className="flex flex-col gap-4 rounded-2xl bg-neutral-100 p-5 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Session active</p>
						<h1 className="mt-2 text-2xl font-semibold">{user.name}</h1>
						<p className="mt-1 text-sm text-neutral-600">{user.email}</p>
					</div>
					<button
						type="button"
						onClick={signOut}
						className="h-10 rounded-xl bg-neutral-50 px-4 text-sm font-semibold text-secondary-800 shadow-sm hover:bg-neutral-200"
					>
						Se deconnecter
					</button>
				</div>

				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-2xl bg-neutral-100 p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Type de compte</p>
						<p className="mt-2 text-lg font-semibold text-secondary-900">{profile?.accountType || 'Non renseigne'}</p>
					</div>
					<div className="rounded-2xl bg-neutral-100 p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Email verifie</p>
						<p className="mt-2 text-lg font-semibold text-secondary-900">{user.emailVerified ? 'Oui' : 'Non'}</p>
					</div>
					<button
						type="button"
						onClick={() => navigate('/tickets-incidents')}
						className="rounded-2xl bg-neutral-100 p-4 text-left hover:bg-primary-50"
					>
						<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Support</p>
						<p className="mt-2 text-lg font-semibold text-secondary-900">Tickets incidents</p>
					</button>
					{isProfessional ? (
						<button
							type="button"
							onClick={() => navigate('/dashboard-producteur')}
							className="rounded-2xl bg-neutral-100 p-4 text-left hover:bg-primary-50"
						>
							<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Professionnel</p>
							<p className="mt-2 text-lg font-semibold text-secondary-900">Dashboard vendeur</p>
						</button>
					) : null}
				</div>

				{profileState.loading ? <p className="mt-6 text-sm text-neutral-600">Chargement du profil...</p> : null}
				{profileState.error ? <p className="mt-6 text-sm text-red-700">{profileState.error}</p> : null}

				{profile?.professionnel ? (
					<div className="mt-6 rounded-2xl bg-neutral-100 p-5">
						<p className="text-sm font-semibold text-secondary-900">Entreprise</p>
						<p className="mt-2 text-sm text-secondary-600">{profile.professionnel.entreprise.nom}</p>
						<p className="text-sm text-secondary-600">SIRET {profile.professionnel.entreprise.siret}</p>
						<p className="text-sm text-secondary-600">{profile.professionnel.entreprise.adresse_ligne}</p>
						<p className="text-sm text-secondary-600">
							{profile.professionnel.entreprise.code_postal} {profile.professionnel.entreprise.ville}
						</p>
					</div>
				) : null}
			</SurfaceCard>
		</PageShell>
	);
}
