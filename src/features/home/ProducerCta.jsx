import { Link } from 'react-router';
import { homeImages } from './homeData';

export default function ProducerCta({ isAuthenticated = false, isProfessional = false }) {
	const content = getCtaContent({ isAuthenticated, isProfessional });

	return (
		<section className="px-4 py-16 md:py-24">
			<div className="relative mx-auto min-h-[420px] w-[min(1180px,100%)] overflow-hidden rounded-[2rem] bg-primary-800 p-8 text-white shadow-[0_24px_70px_rgba(29,52,34,.18)] md:p-14">
				<img
					alt=""
					className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-35 mix-blend-screen md:block"
					src={homeImages.producer}
				/>
				<div className="relative max-w-2xl">
					<p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-100">{content.eyebrow}</p>
					<h2 className="mt-4 text-5xl font-bold leading-tight md:text-6xl">{content.title}</h2>
					<p className="mt-6 text-lg leading-8 text-primary-50">
						{content.description}
					</p>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<Link
							className="inline-flex h-12 items-center justify-center rounded-xl bg-neutral-50 px-6 text-sm font-semibold text-primary-800 transition hover:bg-primary-50"
							to={content.primaryPath}
						>
							{content.primaryLabel}
						</Link>
						{content.secondaryPath ? (
							<Link
								className="inline-flex h-12 items-center justify-center rounded-xl border border-primary-100/40 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
								to={content.secondaryPath}
							>
								{content.secondaryLabel}
							</Link>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}

function getCtaContent({ isAuthenticated, isProfessional }) {
	if (isProfessional) {
		return {
			eyebrow: 'Espace producteur',
			title: 'Vendez mieux, gardez la main.',
			description: 'Gérez vos informations, vos entreprises, vos lieux de vente, vos produits, les stocks et les commandes depuis votre espace professionnel.',
			primaryLabel: 'Voir le dashboard',
			primaryPath: '/dashboard-producteur',
			secondaryLabel: 'Consulter mon compte',
			secondaryPath: '/compte'
		};
	}

	if (isAuthenticated) {
		return {
			eyebrow: 'Espace client',
			title: 'Retrouvez vos achats au même endroit.',
			description: 'Accédez à votre compte pour suivre vos informations, ouvrir un ticket incident et préparer vos prochaines commandes locales.',
			primaryLabel: 'Consulter mon compte',
			primaryPath: '/compte',
			secondaryLabel: 'Contacter le support',
			secondaryPath: '/tickets-incidents'
		};
	}

	return {
		eyebrow: 'Espace producteur',
		title: 'Vendez mieux, gardez la main.',
		description: 'Vous produisez localement ? Créez un compte professionnel pour gérer vos lieux de vente, vos produits, vos stocks et vos commandes.',
		primaryLabel: 'Devenir producteur',
		primaryPath: '/register',
		secondaryLabel: null,
		secondaryPath: null
	};
}
