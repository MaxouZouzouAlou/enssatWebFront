import { Link } from 'react-router';
import SectionHeader from '../../components/layout/SectionHeader.jsx';
import SurfaceCard from '../../components/layout/SurfaceCard.jsx';
import { collections } from './homeData';

const softGreenFilter = {
	filter: 'brightness(0.78)'
};

export default function CollectionGrid() {
	return (
		<section className="bg-neutral-50 py-16 md:py-24">
			<div className="mx-auto w-[min(1180px,calc(100%-2rem))]">
				<SectionHeader
					eyebrow="Marché local"
					title="Collections de saison"
					actions={<Link className="text-sm font-bold text-primary-700 hover:text-primary-800" to="/produits">Voir le catalogue</Link>}
				/>

				<div className="mt-10 grid gap-5 md:grid-cols-12">
					{collections.map((item) => (
						<CollectionCard key={item.title} item={item} />
					))}
				</div>
			</div>
		</section>
	);
}

function CollectionCard({ item }) {
	return (
		<SurfaceCard
			className={`group relative min-h-64 overflow-hidden p-6 ${item.className}`}
			tone={item.image ? 'secondary' : item.tone}
		>
			{item.image ? (
				<>
					<img
						alt=""
						className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
						style={softGreenFilter}
						src={item.image}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-secondary-900/75 via-secondary-900/25 to-transparent" />
				</>
			) : null}
			<div className="relative flex h-full min-h-52 flex-col justify-between">
				<span className="text-xs font-bold uppercase tracking-[0.22em] text-primary-600">{item.label}</span>
				<div>
					<h3 className="text-3xl font-bold">{item.title}</h3>
					<p className={`mt-3 max-w-sm leading-7 ${item.image ? 'text-neutral-100' : 'text-neutral-700'}`}>{item.text}</p>
				</div>
			</div>
		</SurfaceCard>
	);
}
