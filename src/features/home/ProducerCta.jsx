import { ActionLink } from '../../components/Button.jsx';
import { homeImages } from './homeData';

const softGreenFilter = {
	filter: 'brightness(0.78)'
};

export default function ProducerCta({ isAuthenticated = false, isProfessional = false }) {
	const content = getCtaContent({ isAuthenticated, isProfessional });
	const ctaImage = isAuthenticated && !isProfessional ? homeImages.customer : homeImages.producer;

	return (
		<section className="px-4 py-16 md:py-24">
			<div className="relative mx-auto min-h-[420px] w-[min(1180px,100%)] overflow-hidden rounded-[2rem] bg-primary-800 p-8 text-white shadow-[0_24px_70px_rgba(29,52,34,.18)] md:p-14">
				<img
					alt=""
					className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-35 mix-blend-screen md:block"
					style={ctaImage === homeImages.customer ? undefined : softGreenFilter}
					src={ctaImage}
				/>
				<div className="relative max-w-2xl">
					<p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-100">{content.eyebrow}</p>
					<h2 className="mt-4 text-5xl font-bold leading-tight md:text-6xl">{content.title}</h2>
					<p className="mt-6 text-lg leading-8 text-primary-50">
						{content.description}
					</p>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<ActionLink className="h-12 px-6" to={content.primaryPath} variant="light">
							{content.primaryLabel}
						</ActionLink>
						{content.secondaryPath ? (
							<ActionLink className="h-12 px-6" to={content.secondaryPath} variant="outline">
								{content.secondaryLabel}
							</ActionLink>
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
			eyebrow: 'Espace pro',
			title: 'Vendez mieux, gardez la main.',
			description: 'Gérez vos informations, vos entreprises, vos lieux de vente, vos produits, les stocks et les commandes depuis votre espace professionnel.',
			primaryLabel: 'Ouvrir l espace pro',
			primaryPath: '/espace-pro',
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
		primaryPath: '/register?type=professionnel',
		secondaryLabel: null,
		secondaryPath: null
	};
}
