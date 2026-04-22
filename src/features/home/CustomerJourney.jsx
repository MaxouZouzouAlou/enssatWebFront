import { SectionHeader, SurfaceCard } from '../../components/layout';
import { customerSteps } from './homeData';

export default function CustomerJourney() {
	return (
		<section className="bg-neutral-50 py-16 md:py-24">
			<div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start">
				<SectionHeader eyebrow="Parcours client" title="Peu de pages, des actions visibles">
					<p>
						L&apos;interface met en avant les usages attendus : consulter les produits,
						préparer une commande, retrouver ses favoris et suivre son historique.
					</p>
				</SectionHeader>
				<div className="grid gap-4">
					{customerSteps.map(([number, title, text]) => (
						<SurfaceCard className="grid gap-4 p-5 sm:grid-cols-[4rem_1fr] sm:items-center" key={number} tone="muted">
							<span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-700 text-xl font-bold text-white">
								{number}
							</span>
							<div>
								<h3 className="text-2xl font-bold">{title}</h3>
								<p className="mt-1 leading-7 text-neutral-700">{text}</p>
							</div>
						</SurfaceCard>
					))}
				</div>
			</div>
		</section>
	);
}
