import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';

function LegalSection({ title, children }) {
	return (
		<section className="space-y-3">
			<h2 className="text-xl font-semibold text-secondary-900">{title}</h2>
			<div className="space-y-3 text-sm leading-7 text-secondary-700">{children}</div>
		</section>
	);
}

export default function LegalMentionsPage() {
	return (
		<PageShell contentClassName="max-w-4xl">
			<SectionHeader eyebrow="Informations légales" title="Mentions légales">
				<p>Informations de référence pour le projet Local&apos;zh et son cadre de publication pédagogique.</p>
			</SectionHeader>

			<SurfaceCard className="mt-8 space-y-8 p-6 sm:p-8">
				<LegalSection title="Éditeur du site">
					<p>Local&apos;zh est un projet pédagogique réalisé dans le cadre de la formation ENSSAT.</p>
					<p>ENSSAT, 6 rue de Kerampont, CS 80518, 22305 Lannion Cedex, France.</p>
				</LegalSection>

				<LegalSection title="Responsable de publication">
					<p>Le contenu est publié dans un cadre d&apos;enseignement et de démonstration technique par l&apos;équipe projet rattachée à l&apos;ENSSAT.</p>
				</LegalSection>

				<LegalSection title="Hébergement">
					<p>Le projet peut être hébergé sur une infrastructure de démonstration ou de développement interne au cadre de formation.</p>
				</LegalSection>

				<LegalSection title="Contact">
					<p>Pour toute question relative au projet, l&apos;adresse de référence est celle de l&apos;ENSSAT à Lannion : 6 rue de Kerampont, 22305 Lannion Cedex.</p>
				</LegalSection>
			</SurfaceCard>
		</PageShell>
	);
}
