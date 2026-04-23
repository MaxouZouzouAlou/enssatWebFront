import { ActionLink } from '../../components/Button.jsx';
import { homeImages } from './homeData';

const softGreenFilter = {
	filter: 'brightness(0.78)'
};

export default function HomeHero({ isAuthenticated = false }) {
	return (
		<section className="mx-auto grid w-[min(1180px,calc(100%-2rem))] gap-10 py-14 md:grid-cols-[0.95fr_1.05fr] md:items-center md:py-20">
			<div>
				<p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-600">Marketplace locale en Bretagne</p>
				<h1 className="mt-5 text-6xl font-bold leading-[0.9] text-primary-700 sm:text-7xl lg:text-8xl">
					Local&apos;zh
				</h1>
				<p className="mt-6 max-w-xl text-lg leading-8 text-neutral-700">
					La marketplace des produits locaux qui relie clients, producteurs et lieux de vente
					pour commander plus simplement, plus près, et au bon moment.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<ActionLink className="h-12 px-6" to="/produits">
						Découvrir les produits
					</ActionLink>
					{isAuthenticated ? (
						<ActionLink className="h-12 px-6" to="/compte" variant="light">
							Mon compte
						</ActionLink>
					) : (
						<ActionLink className="h-12 px-6" to="/register" variant="light">
							Créer un compte
						</ActionLink>
					)}
				</div>
			</div>

			<figure className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-neutral-300 shadow-[0_24px_70px_rgba(29,52,34,.18)] md:min-h-[620px]">
				<img
					alt="Paysage agricole breton au lever du soleil"
					className="h-full min-h-[420px] w-full object-cover md:min-h-[620px]"
					style={softGreenFilter}
					src={homeImages.hero}
				/>
				<figcaption className="absolute bottom-5 left-5 right-5 rounded-2xl bg-neutral-50/85 p-5 text-secondary-900 shadow-[0_18px_45px_rgba(29,52,34,.16)] backdrop-blur-md">
					<p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Circuit court</p>
					<div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<p className="max-w-sm text-2xl font-bold leading-tight">Du lieu de production à votre panier.</p>
						<span className="inline-flex w-fit rounded-full bg-secondary-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary-700">
							Bretagne
						</span>
					</div>
				</figcaption>
			</figure>
		</section>
	);
}
