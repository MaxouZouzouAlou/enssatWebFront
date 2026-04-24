import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import ProfessionalCompanySwitcher from '../../components/ProfessionalCompanySwitcher.jsx';
import CompanySalesPointsManager from './CompanySalesPointsManager.jsx';
import ProductManager from './ProductManager.jsx';
import PurchaseInvoicesPanel from './PurchaseInvoicesPanel.jsx';
import MetricCard from '../../components/layout/MetricCard.jsx';
import PageShell from '../../components/layout/PageShell.jsx';
import SectionHeader from '../../components/layout/SectionHeader.jsx';
import SurfaceCard from '../../components/layout/SurfaceCard.jsx';
import { downloadProfessionalSalesReport, fetchProfessionalDashboard } from '../../services/dashboard-client';
import { useToast } from '../../app/ToastProvider.jsx';
import { queryKeys } from '../../utils/queryKeys.js';
import { euro, formatTrend, number } from '../../utils/formatters.js';

function RestrictedDashboardState({ title, message }) {
	return (
		<PageShell contentClassName="max-w-2xl">
			<SurfaceCard className="p-6">
				<p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-600">Accès restreint</p>
				<h1 className="mt-2 text-3xl font-bold">{title}</h1>
				<p className="mt-3 leading-7 text-neutral-600">{message}</p>
			</SurfaceCard>
		</PageShell>
	);
}

function DashboardPanelHeading({ eyebrow, title, description }) {
	return (
		<div className="mb-4 flex flex-col gap-1">
			{eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-700">{eyebrow}</p> : null}
			<h2 className="text-2xl font-bold text-secondary-900">{title}</h2>
			{description ? <p className="text-sm text-secondary-600">{description}</p> : null}
		</div>
	);
}

export default function ProfessionalDashboard({
	accountType = 'particulier',
	professionalId,
	professionalCompanies = [],
	selectedCompany = null,
	onSelectCompany
}) {
	const toast = useToast();
	const queryClient = useQueryClient();
	const isProfessional = accountType === 'professionnel' || accountType === 'pro';
	const selectedCompanyId = selectedCompany?.id ?? null;
	const [documentMessage, setDocumentMessage] = useState('');

	const dashboardQuery = useQuery({
		queryKey: queryKeys.dashboard.professional(professionalId, selectedCompanyId),
		queryFn: () => fetchProfessionalDashboard(professionalId, selectedCompanyId),
		enabled: Boolean(isProfessional && professionalId && selectedCompanyId),
	});

	const refreshDashboard = async () => {
		await queryClient.invalidateQueries({
			queryKey: queryKeys.dashboard.professional(professionalId, selectedCompanyId),
		});
	};

	const downloadSalesReport = async () => {
		if (!professionalId || !selectedCompanyId) return;
		setDocumentMessage('');
		try {
			await downloadProfessionalSalesReport(professionalId, 90, selectedCompanyId);
			const text = 'Rapport des ventes téléchargé.';
			setDocumentMessage(text);
			toast.showSuccess(text);
		} catch (err) {
			const text = err.message || 'Impossible de télécharger le rapport.';
			setDocumentMessage(text);
			toast.showError(text);
		}
	};

	if (!isProfessional) {
		return (
			<RestrictedDashboardState
				title="Espace pro indisponible"
				message="Cette page est réservée aux comptes professionnels vérifiés. Connectez-vous avec un compte pro pour accéder à vos statistiques de vente."
			/>
		);
	}

	if (!professionalId) {
		return (
			<RestrictedDashboardState
				title="Espace pro indisponible"
				message="Le profil professionnel n'est pas encore disponible pour cette session."
			/>
		);
	}

	if (!selectedCompanyId) {
		return (
			<RestrictedDashboardState
				title="Entreprise indisponible"
				message="Sélectionnez une entreprise rattachée à votre compte pour afficher les statistiques et le catalogue associés."
			/>
		);
	}

	const dashboard = dashboardQuery.data || null;
	const loading = dashboardQuery.isLoading;
	const error = dashboardQuery.error?.message || '';
	const metrics = dashboard?.metrics || {};
	const monthlyRevenue = dashboard?.charts?.monthlyRevenue || [];
	const productSales = dashboard?.charts?.topProducts || [];
	const channelSplit = dashboard?.charts?.channels || [];
	const topCustomers = dashboard?.topCustomers || [];
	const metricCards = [
		["Chiffre d'affaires (30j)", euro.format(metrics.revenue30d || 0), formatTrend(metrics.revenueTrendPct), 'text-primary-600'],
		['Nombre de ventes', number.format(metrics.sales30d || 0), formatTrend(metrics.salesTrendPct), 'text-primary-600'],
		['Panier moyen', euro.format(metrics.averageBasket30d || 0), `${number.format(metrics.orders30d || 0)} commande(s)`, 'text-primary-600'],
		['Taux de rupture', `${Number(metrics.outOfStockRatePct || 0).toFixed(1)}%`, `${number.format(metrics.outOfStockProducts || 0)} produit(s) à surveiller`, 'text-tertiary-500'],
	];
	const customerColumns = [
		{ key: 'customer', header: 'Client' },
		{ key: 'orders', header: 'Commandes' },
		{ key: 'revenue', header: 'CA généré', render: (row) => euro.format(row.revenue) },
	];

	return (
		<PageShell contentClassName="grid grid-cols-12 gap-5">
			<header className="col-span-12 overflow-hidden rounded-[2rem] border border-neutral-200 bg-[radial-gradient(circle_at_top_left,#f3df9b_0%,#fbf7ee_36%,#e7f0e7_100%)] p-6 shadow-[0_24px_60px_rgba(29,52,34,.10)] md:p-8">
				<div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
					<SectionHeader eyebrow="Espace pro" title="Dashboard professionnel" className="md:max-w-3xl">
						<p>
							Suivez vos performances en temps réel : chiffre d'affaires, commandes,
							produits les plus vendus et habitudes d'achat.
						</p>
						{selectedCompany ? (
							<div className="mt-4 grid gap-3 rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-[0_12px_30px_rgba(34,51,35,.08)] backdrop-blur sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
								<div>
									<p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary-500">Entreprise affichée</p>
									<p className="mt-2 text-xl font-bold text-secondary-900">{selectedCompany.nom}</p>
									<p className="mt-1 text-sm text-secondary-600">
										SIRET {selectedCompany.siret} · {selectedCompany.adresse_ligne}, {selectedCompany.code_postal} {selectedCompany.ville}
									</p>
								</div>
								<div className="rounded-2xl bg-secondary-900 px-4 py-3 text-sm font-semibold text-white shadow-lg">
									Vue filtrée par entreprise
								</div>
							</div>
						) : null}
						{loading ? <p className="mt-2 text-sm text-neutral-600">Chargement du dashboard...</p> : null}
						{error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
						{documentMessage ? <p className="mt-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700">{documentMessage}</p> : null}
					</SectionHeader>
					<div className="flex w-full max-w-lg flex-col gap-3 md:w-auto">
						<ProfessionalCompanySwitcher
							companies={professionalCompanies}
							onSelectCompany={onSelectCompany}
							selectedCompanyId={selectedCompany?.id}
							title="Entreprise suivie"
						/>
						<ActionButton className="h-12 px-5 shadow-lg" onClick={downloadSalesReport} type="button">
							Télécharger rapport ventes (CSV)
						</ActionButton>
					</div>
				</div>
			</header>

			<section className="col-span-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{metricCards.map(([label, value, trend, trendClassName]) => (
					<MetricCard key={label} label={label} value={value} trend={trend} trendClassName={trendClassName} />
				))}
			</section>

			<SurfaceCard className="col-span-12 border border-neutral-200 p-5 xl:col-span-7">
				<DashboardPanelHeading eyebrow="Analytics" title="Évolution des ventes" description="6 derniers mois" />
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

			<SurfaceCard className="col-span-12 border border-neutral-200 p-5 xl:col-span-5">
				<DashboardPanelHeading eyebrow="Catalogue" title="Meilleures ventes" description="Top produits" />
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

			<SurfaceCard className="col-span-12 border border-neutral-200 p-5 xl:col-span-5">
				<DashboardPanelHeading eyebrow="Logistique" title="Répartition des livraisons" description="Canaux utilisés" />
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

			<SurfaceCard className="col-span-12 border border-neutral-200 p-5 xl:col-span-7">
				<DashboardPanelHeading eyebrow="Relation client" title="Top clients" description="Comptes les plus actifs" />
				<DataTable columns={customerColumns} emptyLabel="Aucun client à afficher." getRowKey={(row) => row.customer} rows={topCustomers} />
			</SurfaceCard>

			<CompanySalesPointsManager
				professionalId={professionalId}
				selectedCompany={selectedCompany}
			/>

			<ProductManager
				professionalId={professionalId}
				selectedCompanyId={selectedCompanyId}
				selectedCompany={selectedCompany}
				onProductMutated={refreshDashboard}
			/>

			<PurchaseInvoicesPanel professionalId={professionalId} />
		</PageShell>
	);
}
