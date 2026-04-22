import { useEffect, useState } from 'react';
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { ActionButton } from '../../components/Button.jsx';
import DataTable from '../../components/DataTable.jsx';
import MetricCard from '../../components/layout/MetricCard.jsx';
import PageShell from '../../components/layout/PageShell.jsx';
import SectionHeader from '../../components/layout/SectionHeader.jsx';
import SurfaceCard from '../../components/layout/SurfaceCard.jsx';
import { fetchProfessionalDashboard } from '../../services/dashboard-client';

const euro = new Intl.NumberFormat('fr-FR', { currency: 'EUR', style: 'currency' });
const number = new Intl.NumberFormat('fr-FR');

function formatTrend(value) {
	const trend = Number(value || 0);
	const prefix = trend > 0 ? '+' : '';
	return `${prefix}${trend.toFixed(1)}% vs periode precedente`;
}

function RestrictedDashboardState({ title, message }) {
	return (
		<PageShell contentClassName="max-w-2xl">
			<SurfaceCard className="p-6">
				<p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-600">Acces restreint</p>
				<h1 className="mt-2 text-3xl font-bold">{title}</h1>
				<p className="mt-3 leading-7 text-neutral-600">{message}</p>
			</SurfaceCard>
		</PageShell>
	);
}

export default function ProfessionalDashboard({ accountType = 'particulier', professionalId }) {
	const isProfessional = accountType === 'professionnel' || accountType === 'pro';
	const [dashboard, setDashboard] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!isProfessional || !professionalId) return;

		let ignore = false;
		setLoading(true);
		setError('');

		fetchProfessionalDashboard(professionalId)
			.then((data) => {
				if (!ignore) setDashboard(data);
			})
			.catch((err) => {
				if (!ignore) setError(err.message);
			})
			.finally(() => {
				if (!ignore) setLoading(false);
			});

		return () => {
			ignore = true;
		};
	}, [isProfessional, professionalId]);

	if (!isProfessional) {
		return (
			<RestrictedDashboardState
				title="Dashboard vendeur indisponible"
				message="Cette page est reservee aux comptes professionnels verifies. Connectez-vous avec un compte pro pour acceder a vos statistiques de vente."
			/>
		);
	}

	if (!professionalId) {
		return (
			<RestrictedDashboardState
				title="Dashboard vendeur indisponible"
				message="Le profil professionnel n est pas encore disponible pour cette session."
			/>
		);
	}

	const metrics = dashboard?.metrics || {};
	const monthlyRevenue = dashboard?.charts?.monthlyRevenue || [];
	const productSales = dashboard?.charts?.topProducts || [];
	const channelSplit = dashboard?.charts?.channels || [];
	const topCustomers = dashboard?.topCustomers || [];
	const metricCards = [
		['Chiffre d affaires (30j)', euro.format(metrics.revenue30d || 0), formatTrend(metrics.revenueTrendPct), 'text-primary-600'],
		['Nombre de ventes', number.format(metrics.sales30d || 0), formatTrend(metrics.salesTrendPct), 'text-primary-600'],
		['Panier moyen', euro.format(metrics.averageBasket30d || 0), `${number.format(metrics.orders30d || 0)} commande(s)`, 'text-primary-600'],
		['Taux de rupture', `${Number(metrics.outOfStockRatePct || 0).toFixed(1)}%`, `${number.format(metrics.outOfStockProducts || 0)} produit(s) a surveiller`, 'text-tertiary-500'],
	];
	const customerColumns = [
		{ key: 'customer', header: 'Client' },
		{ key: 'orders', header: 'Commandes' },
		{ key: 'revenue', header: 'CA genere', render: (row) => euro.format(row.revenue) },
	];

	return (
		<PageShell contentClassName="grid grid-cols-12 gap-5">
			<header className="col-span-12 flex flex-col justify-between gap-4 md:flex-row md:items-start">
				<SectionHeader
					eyebrow="Espace vendeur"
					title="Dashboard professionnel"
				>
					<p>
						Suivez vos performances en temps reel: chiffre d affaires, commandes,
						produits les plus vendus et habitudes d achat.
					</p>
					{loading ? <p className="mt-2 text-sm text-neutral-600">Chargement du dashboard...</p> : null}
					{error ? <p className="mt-2 text-sm font-semibold text-red-700">{error}</p> : null}
				</SectionHeader>
				<ActionButton className="h-12 px-5" type="button">
					Exporter le rapport
				</ActionButton>
			</header>

			<section className="col-span-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{metricCards.map(([label, value, trend, trendClassName]) => (
					<MetricCard key={label} label={label} value={value} trend={trend} trendClassName={trendClassName} />
				))}
			</section>

				<SurfaceCard className="col-span-12 p-4 xl:col-span-7">
					<div className="mb-3 flex items-end justify-between gap-3">
						<h2 className="text-2xl font-bold">Evolution des ventes</h2>
						<p className="text-sm text-neutral-600">6 derniers mois</p>
					</div>
					<div className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={monthlyRevenue}>
								<defs>
									<linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#2D8635" stopOpacity={0.45} />
										<stop offset="95%" stopColor="#2D8635" stopOpacity={0.05} />
									</linearGradient>
								</defs>
								<CartesianGrid stroke="#CDD5CF" strokeDasharray="3 3" />
								<XAxis dataKey="month" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Area type="monotone" dataKey="revenue" name="CA (EUR)" stroke="#2D8635" fill="url(#revGradient)" strokeWidth={2.5} />
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</SurfaceCard>

				<SurfaceCard className="col-span-12 p-4 xl:col-span-5">
					<div className="mb-3 flex items-end justify-between gap-3">
						<h2 className="text-2xl font-bold">Meilleures ventes</h2>
						<p className="text-sm text-neutral-600">Top produits</p>
					</div>
					<div className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={productSales} layout="vertical" margin={{ left: 10, right: 20 }}>
								<CartesianGrid stroke="#CDD5CF" strokeDasharray="3 3" />
								<XAxis type="number" />
								<YAxis type="category" dataKey="name" width={120} />
								<Tooltip />
								<Bar dataKey="sales" name="Ventes" fill="#D35400" radius={[0, 8, 8, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</SurfaceCard>

				<SurfaceCard className="col-span-12 p-4 xl:col-span-5">
					<div className="mb-3 flex items-end justify-between gap-3">
						<h2 className="text-2xl font-bold">Repartition des livraisons</h2>
						<p className="text-sm text-neutral-600">Canaux utilises</p>
					</div>
					<div className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie data={channelSplit} dataKey="value" nameKey="name" outerRadius={100} innerRadius={56} fill="#2D8635" label />
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</SurfaceCard>

				<SurfaceCard className="col-span-12 p-4 xl:col-span-7">
					<div className="mb-3 flex items-end justify-between gap-3">
						<h2 className="text-2xl font-bold">Top clients</h2>
						<p className="text-sm text-neutral-600">Comptes les plus actifs</p>
					</div>
					<DataTable columns={customerColumns} emptyLabel="Aucun client à afficher." getRowKey={(row) => row.customer} rows={topCustomers} />
				</SurfaceCard>
		</PageShell>
	);
}
