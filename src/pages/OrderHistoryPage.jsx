import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { fetchOrderHistory } from '../services/orders-client.js';

function formatDate(value) {
	if (!value) return 'Date inconnue';
	return new Date(value).toLocaleDateString('fr-FR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	});
}

export default function OrderHistoryPage() {
	const navigate = useNavigate();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let ignore = false;

		fetchOrderHistory()
			.then((data) => {
				if (!ignore) setOrders(data?.items || []);
			})
			.catch((err) => {
				if (!ignore) setError(err.message || 'Impossible de charger vos commandes.');
			})
			.finally(() => {
				if (!ignore) setLoading(false);
			});

		return () => {
			ignore = true;
		};
	}, []);

	return (
		<PageShell contentClassName="max-w-5xl">
			<SectionHeader eyebrow="Compte" title="Historique des commandes">
				<p>Retrouvez toutes vos commandes et consultez leur détail.</p>
			</SectionHeader>

			<SurfaceCard className="mt-8 p-5 sm:p-6">
				{loading ? <p className="text-sm text-secondary-600">Chargement de vos commandes...</p> : null}
				{error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
				{!loading && !error && orders.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-8 text-center">
						<p className="text-base font-semibold text-secondary-900">Vous n&apos;avez pas encore effectué de commande.</p>
						<p className="mt-2 text-sm text-secondary-600">
							Quand vous validerez un panier, votre historique apparaîtra ici avec le détail de chaque commande.
						</p>
					</div>
				) : null}
				{!loading && !error && orders.length > 0 ? (
					<div className="space-y-3">
						{orders.map((order) => (
							<button
								key={order.idCommande}
								type="button"
								onClick={() => navigate(`/commandes/${order.idCommande}`)}
								className="flex w-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-[#fcfaf5] px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-[0_18px_32px_rgba(29,52,34,.10)] sm:flex-row sm:items-center sm:justify-between"
							>
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary-700">Commande #{order.idCommande}</p>
									<p className="mt-2 text-lg font-semibold text-secondary-900">{formatDate(order.dateCommande)}</p>
									<p className="mt-1 text-sm text-secondary-600">
										{order.modeLivraison || 'Mode de livraison non renseigné'} • {order.status}
									</p>
								</div>
								<div className="flex flex-col items-start gap-2 sm:items-end">
									<p className="text-lg font-bold text-secondary-900">{Number(order.prixTotal || 0).toFixed(2)} €</p>
									<p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary-500">
										{order.lignesCount} ligne(s) • {order.quantiteTotale} article(s)
									</p>
								</div>
							</button>
						))}
					</div>
				) : null}
			</SurfaceCard>
		</PageShell>
	);
}
