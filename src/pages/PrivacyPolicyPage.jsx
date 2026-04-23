import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';

function PrivacySection({ title, children }) {
	return (
		<section className="space-y-3">
			<h2 className="text-xl font-semibold text-secondary-900">{title}</h2>
			<div className="space-y-3 text-sm leading-7 text-secondary-700">{children}</div>
		</section>
	);
}

export default function PrivacyPolicyPage() {
	return (
		<PageShell contentClassName="max-w-4xl">
			<SectionHeader eyebrow="Confidentialité" title="Politique de confidentialité">
				<p>Cette page résume les principes de traitement des données pour l&apos;usage de démonstration de Local&apos;zh.</p>
			</SectionHeader>

			<SurfaceCard className="mt-8 space-y-8 p-6 sm:p-8">
				<PrivacySection title="Données traitées">
					<p>Le service peut traiter des données de compte, d&apos;adresse, de commande et de navigation strictement nécessaires au fonctionnement de la plateforme.</p>
				</PrivacySection>

				<PrivacySection title="Finalités">
					<p>Les données sont utilisées pour authentifier les utilisateurs, afficher les produits, gérer les commandes, proposer des points de retrait et assurer le suivi technique du projet.</p>
				</PrivacySection>

				<PrivacySection title="Minimisation">
					<p>Le projet vise à limiter les données collectées aux seules informations utiles à l&apos;usage pédagogique et au fonctionnement applicatif.</p>
				</PrivacySection>

				<PrivacySection title="Droits et contact">
					<p>Pour toute demande relative aux données dans le cadre du projet, le point de contact de référence est l&apos;ENSSAT, 6 rue de Kerampont, 22305 Lannion Cedex.</p>
				</PrivacySection>
			</SurfaceCard>
		</PageShell>
	);
}
