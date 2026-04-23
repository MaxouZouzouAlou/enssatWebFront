import PickupRouteMap from './PickupRouteMap.jsx';

function formatAddress(salesPoint) {
	if (!salesPoint?.adresse) return '';
	return [salesPoint.adresse.ligne, salesPoint.adresse.codePostal, salesPoint.adresse.ville].filter(Boolean).join(', ');
}

export default function PickupRoutePlanner({
	loading = false,
	error = '',
	salesPoints = [],
	recommendedLieuIds = [],
	selectedLieuIds = [],
	onToggleLieu,
	routePreview = null,
	routeError = '',
	disabled = false
}) {
	if (loading) {
		return (
			<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
				<p className="text-sm text-secondary-600">Chargement des points de vente disponibles...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
				{error}
			</div>
		);
	}

	if (!salesPoints.length) {
		return (
			<div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-secondary-600">
				Aucun point de vente exploitable n&apos;est disponible pour les produits actuels du panier.
			</div>
		);
	}

	const uncoveredProducts = routePreview?.uncoveredProducts || [];
	const routeStops = routePreview?.route?.stops || [];

	return (
		<div className="space-y-4 rounded-2xl border border-neutral-200 bg-[#fcfaf5] p-4">
			<div>
				<p className="text-sm font-semibold text-secondary-900">Points de vente à visiter</p>
				<p className="mt-1 text-sm text-secondary-600">
					Sélectionnez les lieux où retirer vos produits. Le meilleur ordre de passage est calculé automatiquement.
				</p>
				{recommendedLieuIds.length ? (
					<p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary-700">
						Sélection recommandée : {recommendedLieuIds.length} point(s)
					</p>
				) : null}
			</div>

			<div className="grid gap-3">
				{salesPoints.map((salesPoint) => {
					const checked = selectedLieuIds.includes(Number(salesPoint.idLieu));
					const isRecommended = recommendedLieuIds.includes(Number(salesPoint.idLieu));

					return (
						<label
							key={salesPoint.idLieu}
							className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
								checked
									? 'border-primary-300 bg-white shadow-sm'
									: 'border-neutral-200 bg-white hover:border-primary-200'
							}`}
						>
							<input
								type="checkbox"
								className="mt-1 h-4 w-4 accent-primary-700"
								checked={checked}
								disabled={disabled}
								onChange={() => onToggleLieu?.(Number(salesPoint.idLieu))}
							/>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<p className="font-semibold text-secondary-900">{salesPoint.nom}</p>
									{isRecommended ? (
										<span className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-700">
											Recommandé
										</span>
									) : null}
								</div>
								<p className="mt-1 text-sm text-secondary-600">{formatAddress(salesPoint)}</p>
								{salesPoint.horaires ? (
									<p className="mt-1 text-xs text-secondary-500">Horaires : {salesPoint.horaires}</p>
								) : null}
								{salesPoint.productNames?.length ? (
									<p className="mt-2 text-xs text-secondary-500">
										Produits disponibles : {salesPoint.productNames.join(', ')}
									</p>
								) : null}
							</div>
						</label>
					);
				})}
			</div>

			{routeError ? (
				<div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
					{routeError}
				</div>
			) : null}

			{uncoveredProducts.length ? (
				<div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
					Les points sélectionnés ne couvrent pas encore tous les produits : {uncoveredProducts.map((product) => product.nom).join(', ')}.
				</div>
			) : null}

			{routeStops.length ? (
				<>
					<div className="rounded-2xl border border-neutral-200 bg-white p-4">
						<p className="text-sm font-semibold text-secondary-900">Ordre de passage conseillé</p>
						<p className="mt-1 text-sm text-secondary-600">
							{routeStops.length} arrêt(s) • {Number(routePreview?.route?.totalDistanceKm || 0).toFixed(2)} km estimés entre les points
						</p>
						<div className="mt-3 space-y-2">
							{routeStops.map((stop) => (
								<div key={`${stop.idLieu}-${stop.stopNumber}`} className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 px-3 py-2">
									<div>
										<p className="font-semibold text-secondary-900">{stop.stopNumber}. {stop.nom}</p>
										<p className="text-sm text-secondary-600">{formatAddress(stop)}</p>
									</div>
									<p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary-500">
										{stop.stopNumber === 1 ? 'Départ' : `${Number(stop.legDistanceKm || 0).toFixed(2)} km`}
									</p>
								</div>
							))}
						</div>
					</div>

					<PickupRouteMap stops={routeStops} />
				</>
			) : null}
		</div>
	);
}
