import { Link } from 'react-router';

function getFooterLinks({ isAuthenticated, isProfessional }) {
	return [
		{
			title: 'Explorer',
			links: [
				['Produits locaux', '/achat'],
				['Panier', '/panier'],
				...(isAuthenticated ? [] : [['Créer un compte', '/register']])
			]
		},
		{
			title: 'Producteurs',
			links: [
				...(isProfessional ? [['Espace vendeur', '/dashboard-producteur']] : []),
				...(isAuthenticated ? [] : [['Devenir producteur', '/register']])
			]
		},
		{
			title: 'Support',
			links: [
				...(isAuthenticated ? [['Tickets incidents', '/tickets-incidents'], ['Mon compte', '/compte']] : [['Connexion', '/login']])
			]
		}
	].filter((group) => group.links.length > 0);
}

export default function SiteFooter({ isAuthenticated = false, isProfessional = false }) {
	const footerLinks = getFooterLinks({ isAuthenticated, isProfessional });

	return (
		<footer className="bg-neutral-50 text-secondary-800">
			<div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] gap-10 py-14 md:grid-cols-[1.4fr_2fr] md:py-20">
				<div>
					<Link className="text-3xl font-bold text-primary-700" to="/">
						Local&apos;zh
					</Link>
					<p className="mt-4 max-w-md leading-7 text-neutral-700">
						Local&apos;zh rapproche les clients des producteurs locaux : produits de saison,
						lieux de vente, commandes et récupération au plus près du territoire.
					</p>
					<div className="mt-6 flex flex-wrap gap-3 text-sm">
						<span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-2 font-semibold text-primary-800">
							<span className="material-symbols-rounded text-lg">storefront</span>
							Retrait producteur
						</span>
						<span className="inline-flex items-center gap-2 rounded-full bg-secondary-100 px-3 py-2 font-semibold text-secondary-800">
							<span className="material-symbols-rounded text-lg">local_shipping</span>
							Point relais ou livraison
						</span>
					</div>
				</div>

				<nav className="grid gap-8 sm:grid-cols-3" aria-label="Navigation pied de page">
					{footerLinks.map((group) => (
						<div key={group.title}>
							<h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">{group.title}</h2>
							<ul className="mt-4 space-y-3 text-sm text-neutral-700">
								{group.links.map(([label, path]) => (
									<li key={label}>
										<Link className="transition hover:text-primary-700" to={path}>
											{label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>
			</div>

			<div className="bg-neutral-100">
				<div className="mx-auto flex w-[min(1180px,calc(100%-2rem))] flex-col gap-3 py-5 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
					<p>Local&apos;zh - Projet web produits locaux</p>
					<p>NodeJS Express MySQL React</p>
				</div>
			</div>
		</footer>
	);
}
