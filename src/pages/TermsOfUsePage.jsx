import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';

function TermsSection({ title, children }) {
	return (
		<section className="space-y-3">
			<h2 className="text-xl font-semibold text-secondary-900">{title}</h2>
			<div className="space-y-3 text-sm leading-7 text-secondary-700">{children}</div>
		</section>
	);
}

export default function TermsOfUsePage() {
	return (
		<PageShell contentClassName="max-w-4xl">
			<SectionHeader eyebrow="Conditions" title="Conditions d&apos;utilisation">
				<p>Cadre général d&apos;utilisation de la plateforme Local&apos;zh dans un contexte de projet web et de démonstration.</p>
			</SectionHeader>

			<SurfaceCard className="mt-8 space-y-8 p-6 sm:p-8">
				<TermsSection title="Objet">
					<p>La plateforme permet de consulter un catalogue, gérer un panier, passer commande et accéder à des espaces utilisateurs selon le type de compte.</p>
				</TermsSection>

				<TermsSection title="Accès au service">
					<p>L&apos;accès peut être interrompu ou adapté pour des raisons pédagogiques, techniques, de maintenance ou d&apos;évolution du projet.</p>
				</TermsSection>

				<TermsSection title="Comportement attendu">
					<p>L&apos;utilisateur s&apos;engage à utiliser l&apos;application de bonne foi, à ne pas perturber le service et à ne pas tenter d&apos;accéder à des données ou fonctionnalités non autorisées.</p>
				</TermsSection>

				<TermsSection title="Limitation">
					<p>Le service est fourni dans un cadre d&apos;apprentissage et de démonstration. Il ne constitue pas un service commercial déployé en production.</p>
				</TermsSection>
			</SurfaceCard>
		</PageShell>
	);
}
