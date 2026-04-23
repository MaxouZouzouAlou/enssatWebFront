import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import PickupRouteMap from '../features/pickup-route/PickupRouteMap.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { fetchOrderById } from '../services/orders-client.js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:49161';

function resolveProductImageUrl(imageValue) {
	if (!imageValue || typeof imageValue !== 'string') return null;
	if (/^https?:\/\//i.test(imageValue) || imageValue.startsWith('data:')) return imageValue;
	return `${API_BASE_URL.replace(/\/$/, '')}${imageValue.startsWith('/') ? imageValue : `/${imageValue}`}`;
}

function formatDate(value) {
	if (!value) return 'Date inconnue';
	return new Date(value).toLocaleString('fr-FR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function formatAddress(stop) {
	if (!stop?.adresse) return '';
	return [stop.adresse.ligne, stop.adresse.codePostal, stop.adresse.ville].filter(Boolean).join(', ');
}

export default function OrderDetailPage() {
	const navigate = useNavigate();
	const { idCommande } = useParams();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let ignore = false;

		fetchOrderById(idCommande)
			.then((response) => {
				if (!ignore) setData(response);
			})
			.catch((err) => {
				if (!ignore) setError(err.message || 'Impossible de charger cette commande.');
			})
			.finally(() => {
				if (!ignore) setLoading(false);
			});

		return () => {
			ignore = true;
		};
	}, [idCommande]);

	if (loading) {
		return (
			<PageShell contentClassName="max-w-5xl">
				<SurfaceCard className="text-center">
					<p className="text-sm font-semibold text-primary-700">Chargement de la commande...</p>
				</SurfaceCard>
			</PageShell>
		);
	}

	if (error || !data?.order) {
		return (
			<PageShell contentClassName="max-w-5xl">
				<SurfaceCard className="text-center">
					<p className="text-sm font-semibold text-red-700">{error || 'Commande introuvable.'}</p>
					<div className="mt-4 flex justify-center gap-3">
						<ActionButton type="button" variant="secondary" onClick={() => navigate('/commandes')}>
							Retour à l'historique
						</ActionButton>
					</div>
				</SurfaceCard>
			</PageShell>
		);
	}

	const { order, items = [], pickupRoute, delivery } = data;

	return (
		<PageShell contentClassName="max-w-5xl">
			<SectionHeader eyebrow="Commande" title={`Commande #${order.idCommande}`}>
				<p>Consultez le détail de votre commande, ses lignes et son mode de livraison.</p>
			</SectionHeader>

			<SurfaceCard className="mt-8 p-5 sm:p-6">
				<div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-[#fcfaf5] p-5 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Récapitulatif</p>
						<p className="mt-2 text-lg font-semibold text-secondary-900">{formatDate(order.dateCommande)}</p>
						<p className="mt-1 text-sm text-secondary-600">{order.modeLivraison || 'Mode de livraison non renseigné'}</p>
						<p className="mt-1 text-sm text-secondary-600">Paiement : {order.modePaiement || 'Non renseigné'}</p>
						<p className="mt-1 text-sm text-secondary-600">Statut : {order.status}</p>
					</div>
					<div className="flex flex-col items-start gap-3 sm:items-end">
						<p className="text-2xl font-bold text-secondary-900">{Number(order.prixTotal || 0).toFixed(2)} €</p>
						<Link className="text-sm font-semibold text-primary-700 hover:text-primary-800" to="/commandes">
							Retour à l'historique
						</Link>
					</div>
				</div>

				<div className="mt-6 space-y-3">
					{delivery ? (
						<div className="rounded-2xl border border-neutral-200 bg-[#f7f4ec] p-4">
							<p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary-700">Livraison</p>
							{delivery.adresse ? (
								<p className="mt-2 text-sm text-secondary-600">{delivery.adresse}</p>
							) : null}
							{delivery.pointRelais ? (
								<div className="mt-2 text-sm text-secondary-600">
									<p className="font-semibold text-secondary-900">{delivery.pointRelais.nom}</p>
									<p>{formatAddress(delivery.pointRelais.adresse)}</p>
								</div>
							) : null}
						</div>
					) : null}

					{pickupRoute?.stops?.length ? (
						<div className="rounded-2xl border border-neutral-200 bg-[#f7f4ec] p-4">
							<p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary-700">Parcours de retrait</p>
							<p className="mt-2 text-sm text-secondary-600">
								{pickupRoute.stops.length} arrêt(s) • {Number(pickupRoute.totalDistanceKm || 0).toFixed(2)} km estimés entre les points
							</p>
							<div className="mt-3 space-y-2">
								{pickupRoute.stops.map((stop) => (
									<div key={`${stop.idLieu}-${stop.stopNumber}`} className="rounded-xl border border-neutral-200 bg-white px-3 py-3">
										<div className="flex items-start justify-between gap-4">
											<div>
												<p className="font-semibold text-secondary-900">{stop.stopNumber}. {stop.nom}</p>
												<p className="text-sm text-secondary-600">{formatAddress(stop)}</p>
												{stop.horaires ? <p className="mt-1 text-xs text-secondary-500">Horaires : {stop.horaires}</p> : null}
											</div>
											<p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary-500">
												{stop.stopNumber === 1 ? 'Départ' : `${Number(stop.legDistanceKm || 0).toFixed(2)} km`}
											</p>
										</div>
									</div>
								))}
							</div>
							<PickupRouteMap stops={pickupRoute.stops} className="mt-4" />
						</div>
					) : null}

					{items.map((item) => {
						const imageUrl = resolveProductImageUrl(item.imagePath);
						return (
							<div key={`${item.idProduit}-${item.nom}`} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-4">
									{imageUrl ? (
										<img src={imageUrl} alt={item.nom} className="h-16 w-16 rounded-xl border border-neutral-200 object-cover" />
									) : (
										<div className="flex h-16 w-16 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-400">Image</div>
									)}
									<div>
										<p className="font-semibold text-secondary-900">{item.nom}</p>
										<p className="mt-1 text-sm text-secondary-600">{item.nature} • {item.unitaireOuKilo ? 'Unité' : 'Poids'}</p>
										{item.selectedLieu ? (
											<p className="mt-1 text-sm text-secondary-600">
												Retrait : {item.selectedLieu.nom} · {formatAddress(item.selectedLieu.adresse)}
											</p>
										) : null}
									</div>
								</div>
								<div className="flex flex-col items-start gap-1 sm:items-end">
									<p className="text-sm text-secondary-600">Quantité : {item.quantite}</p>
									<p className="font-semibold text-secondary-900">{Number(item.prixTTC || 0).toFixed(2)} €</p>
								</div>
							</div>
						);
					})}
				</div>
			</SurfaceCard>
		</PageShell>
	);
}
