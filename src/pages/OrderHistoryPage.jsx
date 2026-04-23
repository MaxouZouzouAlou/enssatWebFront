import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import {
	createRecurringOrder,
	deleteRecurringOrder,
	fetchOrderHistory,
	fetchRecurringOrders,
	runRecurringOrderNow,
	updateRecurringOrder
} from '../services/orders-client.js';

const FREQUENCY_OPTIONS = [
	{ value: 'weekly', label: 'Chaque semaine' },
	{ value: 'biweekly', label: 'Toutes les 2 semaines' },
	{ value: 'monthly', label: 'Tous les mois' }
];

const FREQUENCY_LABELS = Object.fromEntries(FREQUENCY_OPTIONS.map((item) => [item.value, item.label]));

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
	const [recurringOrders, setRecurringOrders] = useState([]);
	const [subscriptionDrafts, setSubscriptionDrafts] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [actionError, setActionError] = useState('');
	const [busyKey, setBusyKey] = useState('');

	const loadData = async () => {
		const [ordersData, recurringData] = await Promise.all([
			fetchOrderHistory(),
			fetchRecurringOrders()
		]);
		setOrders(ordersData?.items || []);
		setRecurringOrders(recurringData?.items || []);
	};

	useEffect(() => {
		let ignore = false;

		loadData()
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

	const handleCreateRecurring = async (idCommande) => {
		const frequence = subscriptionDrafts[idCommande] || 'weekly';
		setActionError('');
		setBusyKey(`create-${idCommande}`);
		try {
			await createRecurringOrder({ idRefCommande: idCommande, frequence });
			await loadData();
		} catch (createError) {
			setActionError(createError.message || 'Impossible de créer la commande récurrente.');
		} finally {
			setBusyKey('');
		}
	};

	const handleToggleRecurring = async (item) => {
		setActionError('');
		setBusyKey(`toggle-${item.idAuto}`);
		try {
			await updateRecurringOrder(item.idAuto, { estActif: !item.estActif });
			await loadData();
		} catch (toggleError) {
			setActionError(toggleError.message || 'Impossible de modifier cet abonnement.');
		} finally {
			setBusyKey('');
		}
	};

	const handleChangeFrequency = async (item, frequence) => {
		setActionError('');
		setBusyKey(`freq-${item.idAuto}`);
		try {
			await updateRecurringOrder(item.idAuto, { frequence });
			await loadData();
		} catch (freqError) {
			setActionError(freqError.message || 'Impossible de changer la fréquence.');
		} finally {
			setBusyKey('');
		}
	};

	const handleRunNow = async (item) => {
		setActionError('');
		setBusyKey(`run-${item.idAuto}`);
		try {
			await runRecurringOrderNow(item.idAuto);
			await loadData();
		} catch (runError) {
			setActionError(runError.message || 'Impossible de lancer la commande récurrente.');
		} finally {
			setBusyKey('');
		}
	};

	const handleDelete = async (item) => {
		setActionError('');
		setBusyKey(`delete-${item.idAuto}`);
		try {
			await deleteRecurringOrder(item.idAuto);
			await loadData();
		} catch (deleteError) {
			setActionError(deleteError.message || 'Impossible de supprimer cet abonnement.');
		} finally {
			setBusyKey('');
		}
	};

	const existingByOrder = new Map(recurringOrders.map((item) => [Number(item.idRefCommande), item]));

	return (
		<PageShell contentClassName="max-w-5xl">
			<SectionHeader eyebrow="Compte" title="Historique des commandes">
				<p>Retrouvez vos commandes, puis activez des commandes automatiques récurrentes.</p>
			</SectionHeader>

			<SurfaceCard className="mt-8 p-5 sm:p-6">
				{loading ? <p className="text-sm text-secondary-600">Chargement de vos commandes...</p> : null}
				{error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
				{actionError ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{actionError}</p> : null}
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
							<div key={order.idCommande} className="rounded-2xl border border-neutral-200 bg-[#fcfaf5] px-4 py-4 shadow-sm">
								<button
									type="button"
									onClick={() => navigate(`/commandes/${order.idCommande}`)}
									className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between"
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

								<div className="mt-4 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
									<div className="flex flex-wrap items-center gap-2">
										<p className="text-sm font-semibold text-secondary-900">Commande auto</p>
										{existingByOrder.has(Number(order.idCommande)) ? (
											<span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-700">
												Déjà abonnée
											</span>
										) : null}
									</div>
									<div className="flex flex-wrap items-center gap-2">
										<select
											value={subscriptionDrafts[order.idCommande] || 'weekly'}
											onChange={(event) => setSubscriptionDrafts((current) => ({
												...current,
												[order.idCommande]: event.target.value
											}))}
											className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
											disabled={existingByOrder.has(Number(order.idCommande))}
										>
											{FREQUENCY_OPTIONS.map((option) => (
												<option key={option.value} value={option.value}>{option.label}</option>
											))}
										</select>
										<ActionButton
											type="button"
											onClick={() => handleCreateRecurring(order.idCommande)}
											loading={busyKey === `create-${order.idCommande}`}
											disabled={existingByOrder.has(Number(order.idCommande))}
											className="h-10"
										>
											Activer
										</ActionButton>
									</div>
								</div>
							</div>
						))}
					</div>
				) : null}
			</SurfaceCard>

			<SurfaceCard className="mt-6 p-5 sm:p-6">
				<p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary-700">Mes commandes récurrentes</p>
				{!recurringOrders.length ? (
					<p className="mt-3 text-sm text-secondary-600">Aucun abonnement actif pour le moment.</p>
				) : (
					<div className="mt-4 space-y-3">
						{recurringOrders.map((item) => (
							<div key={item.idAuto} className="rounded-2xl border border-neutral-200 bg-white p-4">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
									<div>
										<p className="text-sm font-semibold text-secondary-900">
											Abonnement #{item.idAuto} • commande #{item.idRefCommande}
										</p>
										<p className="mt-1 text-sm text-secondary-600">
											Prochaine exécution: {item.prochaineEcheance ? new Date(item.prochaineEcheance).toLocaleDateString('fr-FR') : 'non définie'}
										</p>
									</div>
									<span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.estActif ? 'bg-primary-100 text-primary-700' : 'bg-neutral-200 text-secondary-700'}`}>
										{item.estActif ? 'Actif' : 'En pause'}
									</span>
								</div>

								<div className="mt-3 flex flex-wrap items-center gap-2">
									<select
										value={item.frequence}
										onChange={(event) => handleChangeFrequency(item, event.target.value)}
										className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
										disabled={busyKey === `freq-${item.idAuto}`}
									>
										{FREQUENCY_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>{option.label}</option>
										))}
									</select>
									<ActionButton type="button" onClick={() => handleToggleRecurring(item)} loading={busyKey === `toggle-${item.idAuto}`} className="h-10" variant="secondary">
										{item.estActif ? 'Mettre en pause' : 'Réactiver'}
									</ActionButton>
									<ActionButton type="button" onClick={() => handleRunNow(item)} loading={busyKey === `run-${item.idAuto}`} className="h-10" variant="light">
										Lancer maintenant
									</ActionButton>
									<ActionButton type="button" onClick={() => handleDelete(item)} loading={busyKey === `delete-${item.idAuto}`} className="h-10 bg-red-700 hover:bg-red-800 focus-visible:ring-red-500">
										Supprimer
									</ActionButton>
								</div>
								<p className="mt-2 text-xs text-secondary-500">
									Fréquence: {FREQUENCY_LABELS[item.frequence] || item.frequence}
								</p>
							</div>
						))}
					</div>
				)}
			</SurfaceCard>
		</PageShell>
	);
}
