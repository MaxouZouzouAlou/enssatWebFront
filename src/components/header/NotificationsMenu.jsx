export default function NotificationsMenu({ isAuthenticated }) {
	if (!isAuthenticated) {
		return (
			<p className="text-sm leading-6 text-neutral-700">
				Connectez-vous pour retrouver les notifications liées à vos commandes, tickets et offres locales.
			</p>
		);
	}

	return (
		<div className="space-y-3">
			<div className="rounded-2xl bg-neutral-100 p-4">
				<p className="text-sm font-semibold text-secondary-900">Aucune notification pour le moment.</p>
				<p className="mt-1 text-sm leading-6 text-neutral-700">
					Les alertes de commande, de support et de fidélité seront affichées ici quand la fonctionnalité sera développée.
				</p>
			</div>
		</div>
	);
}
