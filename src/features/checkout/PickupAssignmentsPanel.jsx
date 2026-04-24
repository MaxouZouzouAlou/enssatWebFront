import SurfaceCard from '../../components/layout/SurfaceCard.jsx';
import PickupRouteMap from '../pickup-route/PickupRouteMap.jsx';

export default function PickupAssignmentsPanel({
	pickupOptimizationReady,
	optimizedStopsCount,
	items = [],
	pickupAssignments = [],
	onAssignmentChange,
	selectedPickupStops = [],
	totalDistanceKm = 0,
	formatAddress
}) {
	return (
		<div className="mt-6 space-y-4">
			<SurfaceCard className="border border-neutral-200 bg-neutral-50 p-4 shadow-none">
				<p className="text-sm font-semibold text-secondary-900">Retrait optimisé par produit</p>
				<p className="mt-1 text-sm text-secondary-600">
					{pickupOptimizationReady
						? 'Une proposition automatique est préremplie pour limiter vos déplacements depuis votre adresse personnelle. Vous pouvez ensuite changer le point de retrait de chaque produit.'
						: 'Le calcul du trajet optimisé nécessite une adresse personnelle géocodable. Corrigez votre adresse de départ si le trajet ne peut pas être calculé.'}
				</p>
				{pickupOptimizationReady && optimizedStopsCount ? (
					<p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary-700">
						Proposition actuelle : {optimizedStopsCount} point(s) de retrait
					</p>
				) : null}
				<div className="mt-4 space-y-4">
					{items.map((item) => {
						const currentLieuId = pickupAssignments.find((assignment) => Number(assignment.idProduit) === Number(item.idProduit))?.idLieu || '';
						return (
							<div key={item.idProduit} className="rounded-2xl border border-neutral-200 bg-white p-4">
								<p className="font-semibold text-secondary-900">{item.nom}</p>
								<p className="mt-1 text-sm text-secondary-600">Quantité : {item.quantite}</p>
								<select
									value={currentLieuId}
									onChange={(event) => onAssignmentChange(item.idProduit, event.target.value)}
									className="mt-3 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
								>
									<option value="">Choisir un point de vente</option>
									{item.availablePickupPoints.map((point) => (
										<option key={point.idLieu} value={point.idLieu}>
											{point.nom} · {point.adresse.ligne}, {point.adresse.codePostal} {point.adresse.ville}
										</option>
									))}
								</select>
							</div>
						);
					})}
				</div>
			</SurfaceCard>

			<SurfaceCard className="border border-neutral-200 bg-[#fcfaf5] p-4 shadow-none">
				<p className="text-sm font-semibold text-secondary-900">Trajet conseillé</p>
				{selectedPickupStops.length ? (
					<>
						<p className="mt-1 text-sm text-secondary-600">
							Départ depuis votre adresse personnelle • {selectedPickupStops.length} arrêt(s) • {Number(totalDistanceKm || 0).toFixed(2)} km estimés
						</p>
						<div className="mt-3 space-y-2">
							{selectedPickupStops.map((stop) => (
								<div key={`${stop.idLieu}-${stop.stopNumber}`} className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-3 py-3">
									<div>
										<p className="font-semibold text-secondary-900">{stop.stopNumber}. {stop.nom}</p>
										<p className="text-sm text-secondary-600">{formatAddress(stop.adresse)}</p>
									</div>
									<p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary-500">
										{Number(stop.legDistanceKm || 0).toFixed(2)} km
									</p>
								</div>
							))}
						</div>
						<PickupRouteMap stops={selectedPickupStops} className="mt-4" />
					</>
				) : (
					<p className="mt-2 text-sm text-secondary-600">
						Sélectionnez un point de retrait pour chaque produit afin d’afficher le trajet optimisé.
					</p>
				)}
			</SurfaceCard>
		</div>
	);
}
