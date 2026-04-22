import { SectionHeader, SurfaceCard } from '../../components/layout';
import { promises } from './homeData';

export default function FeatureHighlights() {
	return (
		<section className="mx-auto w-[min(1180px,calc(100%-2rem))] py-16 md:py-24">
			<SectionHeader align="center" eyebrow="Cahier des charges" title="Pensé pour acheter local sans complexité" />

			<div className="mt-12 grid gap-8 md:grid-cols-3">
				{promises.map((promise) => (
					<SurfaceCard key={promise.title} className="p-6">
						<span className="material-symbols-rounded inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-3xl text-primary-700">
							{promise.icon}
						</span>
						<h3 className="mt-6 text-2xl font-bold">{promise.title}</h3>
						<p className="mt-3 leading-7 text-neutral-700">{promise.text}</p>
					</SurfaceCard>
				))}
			</div>
		</section>
	);
}
