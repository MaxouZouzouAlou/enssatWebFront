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
import ProfessionalCompanySwitcher from '../../components/ProfessionalCompanySwitcher.jsx';
import CompanySalesPointsManager from './CompanySalesPointsManager.jsx';
import MetricCard from '../../components/layout/MetricCard.jsx';
import PageShell from '../../components/layout/PageShell.jsx';
import SectionHeader from '../../components/layout/SectionHeader.jsx';
import SurfaceCard from '../../components/layout/SurfaceCard.jsx';
import {
	downloadOrderInvoice,
	downloadProfessionalSalesReport,
	fetchProfessionalDashboard,
} from '../../services/dashboard-client';
import { getProductsForProfessional, createProductForProfessional, updateProductForProfessional, deleteProductForProfessional } from '../../services/professionalProducts';

const euro = new Intl.NumberFormat('fr-FR', { currency: 'EUR', style: 'currency' });
const number = new Intl.NumberFormat('fr-FR');
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:49161';

function formatTrend(value) {
	const trend = Number(value || 0);
	const prefix = trend > 0 ? '+' : '';
	return `${prefix}${trend.toFixed(1)}% vs periode precedente`;
}

function resolveProductImageUrl(imageValue) {
	if (!imageValue || typeof imageValue !== 'string') return null;
	const trimmed = imageValue.trim();
	if (!trimmed) return null;
	if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
	const base = API_BASE_URL.replace(/\/$/, '');
	const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
	return `${base}${normalizedPath}`;
}

function getProductImageSrc(product) {
	return resolveProductImageUrl(
		product?.imagePath ?? product?.image ?? product?.path ?? product?.imageUrl ?? product?.imageData ?? null
	);
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
	const isProfessional = accountType === 'professionnel' || accountType === 'pro';
	const selectedCompanyId = selectedCompany?.id ?? null;
	const [dashboard, setDashboard] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [documentMessage, setDocumentMessage] = useState('');

// Professional products management: hooks must be declared before any conditional returns
const [myProducts, setMyProducts] = useState([]);
const [loadingProducts, setLoadingProducts] = useState(false);
const [productError, setProductError] = useState('');

const [newProduct, setNewProduct] = useState({ nomProduit: '', prix: '', unitaireOuKilo: 1, stock: 0, nature: 'Autre', bio: false, tva: 0, reductionPro: 0, image: null });
const [imagePreview, setImagePreview] = useState(null);
const { image } = newProduct || {};

const [editingId, setEditingId] = useState(null);
const [editingValues, setEditingValues] = useState({});
const [editingPreview, setEditingPreview] = useState(null);

useEffect(() => {
	if (image) {
		const url = URL.createObjectURL(image);
		setImagePreview(url);
		return () => URL.revokeObjectURL(url);
	}
	setImagePreview(null);
}, [image]);

useEffect(() => {
	if (editingValues.image) {
		const url = URL.createObjectURL(editingValues.image);
		setEditingPreview(url);
		return () => URL.revokeObjectURL(url);
	}
	setEditingPreview(null);
}, [editingValues.image]);

const submitNewProduct = async (e) => {
	e.preventDefault();
	try {
		await createProductForProfessional(professionalId, newProduct, selectedCompanyId);
		const list = await getProductsForProfessional(professionalId, selectedCompanyId);
		setMyProducts(list || []);
		setNewProduct({ nomProduit: '', prix: '', unitaireOuKilo: 1, stock: 0, nature: 'Autre', bio: false, tva: 0, reductionPro: 0, image: null });
	} catch (err) {
		setProductError(err.message || 'Erreur creation produit');
	}
};

useEffect(() => {
    if (!isProfessional || !professionalId || !selectedCompanyId) return;
    let ignore = false;
    setLoadingProducts(true);
    setProductError('');
    getProductsForProfessional(professionalId, selectedCompanyId)
        .then((data) => { if (!ignore) setMyProducts(data || []); })
        .catch((err) => { if (!ignore) setProductError(err.message || 'Erreur'); })
        .finally(() => { if (!ignore) setLoadingProducts(false); });
    return () => { ignore = true; };
}, [isProfessional, professionalId, selectedCompanyId]);

	useEffect(() => {
		if (!isProfessional || !professionalId || !selectedCompanyId) return;

		let ignore = false;
		setLoading(true);
		setError('');

		fetchProfessionalDashboard(professionalId, selectedCompanyId)
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
	}, [isProfessional, professionalId, selectedCompanyId]);

	const downloadSalesReport = async () => {
		if (!professionalId || !selectedCompanyId) return;
		setDocumentMessage('');
		try {
			await downloadProfessionalSalesReport(professionalId, 90, selectedCompanyId);
			setDocumentMessage('Rapport des ventes telecharge.');
		} catch (err) {
			setDocumentMessage(err.message || 'Impossible de telecharger le rapport.');
		}
	};

	const downloadInvoice = async (idCommande) => {
		if (!professionalId || !selectedCompanyId) return;
		setDocumentMessage('');
		try {
			await downloadOrderInvoice(professionalId, idCommande, selectedCompanyId);
			setDocumentMessage(`Facture PDF commande #${idCommande} telechargee.`);
		} catch (err) {
			setDocumentMessage(err.message || 'Impossible de telecharger cette facture.');
		}
	};

	if (!isProfessional) {
		return (
			<RestrictedDashboardState
				title="Espace pro indisponible"
				message="Cette page est reservee aux comptes professionnels verifies. Connectez-vous avec un compte pro pour acceder a vos statistiques de vente."
			/>
		);
	}

	if (!professionalId) {
		return (
			<RestrictedDashboardState
				title="Espace pro indisponible"
				message="Le profil professionnel n est pas encore disponible pour cette session."
			/>
		);
	}

	if (!selectedCompanyId) {
		return (
			<RestrictedDashboardState
				title="Entreprise indisponible"
				message="Selectionnez une entreprise rattachee a votre compte pour afficher les statistiques et le catalogue associes."
			/>
		);
	}

	const metrics = dashboard?.metrics || {};
	const monthlyRevenue = dashboard?.charts?.monthlyRevenue || [];
	const productSales = dashboard?.charts?.topProducts || [];
	const channelSplit = dashboard?.charts?.channels || [];
	const topCustomers = dashboard?.topCustomers || [];
	const recentOrders = dashboard?.recentOrders || [];
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
			<header className="col-span-12 overflow-hidden rounded-[2rem] border border-neutral-200 bg-[radial-gradient(circle_at_top_left,#f3df9b_0%,#fbf7ee_36%,#e7f0e7_100%)] p-6 shadow-[0_24px_60px_rgba(29,52,34,.10)] md:p-8">
				<div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
				<SectionHeader eyebrow="Espace pro" title="Dashboard professionnel" className="md:max-w-3xl">
					<p>
						Suivez vos performances en temps reel: chiffre d affaires, commandes,
						produits les plus vendus et habitudes d achat.
					</p>
					{selectedCompany ? (
						<div className="mt-4 grid gap-3 rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-[0_12px_30px_rgba(34,51,35,.08)] backdrop-blur sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
							<div>
								<p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary-500">Entreprise affichee</p>
								<p className="mt-2 text-xl font-bold text-secondary-900">{selectedCompany.nom}</p>
								<p className="mt-1 text-sm text-secondary-600">
									SIRET {selectedCompany.siret} · {selectedCompany.adresse_ligne}, {selectedCompany.code_postal} {selectedCompany.ville}
								</p>
							</div>
							<div className="rounded-2xl bg-secondary-900 px-4 py-3 text-sm font-semibold text-white shadow-lg">
								Vue filtree par entreprise
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
					Telecharger rapport ventes (CSV)
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
					<DashboardPanelHeading eyebrow="Analytics" title="Evolution des ventes" description="6 derniers mois" />
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
					<DashboardPanelHeading eyebrow="Logistique" title="Repartition des livraisons" description="Canaux utilises" />
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

				<SurfaceCard className="col-span-12 border border-neutral-200 bg-[linear-gradient(180deg,#fffefb_0%,#f7f3ea_100%)] p-5 xl:col-span-12">
					<DashboardPanelHeading eyebrow="Catalogue" title="Mes produits en vente" description="Gerez vos produits et ajoutez-en de nouveaux" />
					{loadingProducts ? (
						<div className="text-sm text-secondary-600">Chargement des produits...</div>
					) : productError ? (
						<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">Erreur: {productError}</div>
					) : (
						<div className="grid gap-5 xl:grid-cols-[1.2fr_.9fr]">
							<div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
								<div className="mb-4 flex items-center justify-between gap-3">
									<div>
										<p className="text-sm font-semibold text-secondary-900">Catalogue actif</p>
										<p className="text-xs text-secondary-500">
											{myProducts.length} produit(s) pour {selectedCompany?.nom}
										</p>
									</div>
								</div>
								<ul className="space-y-3">
										{myProducts.length === 0 ? (
											<li className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-secondary-600">Aucun produit publié.</li>
										) : myProducts.map((p) => (
											<li key={p.idProduit ?? p.id} className="rounded-2xl border border-neutral-200 bg-[#fcfaf5] p-4 shadow-sm">
												{editingId === (p.idProduit || p.id) ? (
													<div className="grid gap-3">
														<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
															{editingPreview || getProductImageSrc(p) ? (
																<img src={editingPreview || getProductImageSrc(p)} alt={p.nomProduit ?? p.nom ?? p.name} className="h-16 w-16 rounded-xl border border-neutral-200 object-cover" />
															) : (
																<div className="flex h-16 w-16 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-400">Image</div>
															)}
												<input className="block w-full text-sm text-secondary-700 file:mr-4 file:rounded-xl file:border-0 file:bg-primary-100 file:px-4 file:py-2 file:font-semibold file:text-primary-700 hover:file:bg-primary-200" type="file" accept="image/*" onChange={(e) => setEditingValues({...editingValues, image: e.target.files && e.target.files[0] ? e.target.files[0] : null})} />
													</div>
													<input className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800" value={editingValues.nomProduit ?? editingValues.nom ?? p.nomProduit ?? p.nom ?? ''} onChange={(e) => setEditingValues({...editingValues, nomProduit: e.target.value})} />
													<div className="grid gap-3 md:grid-cols-3">
														<input type="number" step="0.01" className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800" value={editingValues.prix ?? p.prix} onChange={(e) => setEditingValues({...editingValues, prix: e.target.value})} />
														<input type="number" step="1" className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800" value={editingValues.stock ?? p.stock} onChange={(e) => setEditingValues({...editingValues, stock: e.target.value})} />
														<label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-secondary-700"><input type="checkbox" checked={editingValues.visible ?? Boolean(p.visible)} onChange={(e) => setEditingValues({...editingValues, visible: e.target.checked})} /> Visible</label>
													</div>
													<div>
														<label className="mb-1 block text-xs font-semibold text-neutral-700">Nature</label>
														<select className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800" value={editingValues.nature ?? p.nature ?? 'Autre'} onChange={(e) => setEditingValues({...editingValues, nature: e.target.value})}>
															<option value="Autre">Autre</option>
															<option value="Boulangerie">Boulangerie</option>
															<option value="Légume">Légume</option>
															<option value="Viande">Viande</option>
															<option value="Fruit">Fruit</option>
															<option value="Laitier">Laitier</option>
														</select>
													</div>
													<div className="flex flex-wrap justify-end gap-2">
														<button type="button" className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-300" onClick={() => { setEditingId(null); setEditingValues({}); }}>Annuler</button>
														<button type="button" className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700" onClick={async () => {
															try {
																await updateProductForProfessional(professionalId, p.idProduit || p.id, editingValues, selectedCompanyId);
																const list = await getProductsForProfessional(professionalId, selectedCompanyId);
																setMyProducts(list || []);
																setEditingId(null);
															} catch (err) { setProductError(err.message || 'Erreur mise à jour'); }
														}}>Sauvegarder</button>
														<button type="button" className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700" onClick={async () => {
															if (!window.confirm('Supprimer ce produit ?')) return;
															try {
																await deleteProductForProfessional(professionalId, p.idProduit || p.id, selectedCompanyId);
																const list = await getProductsForProfessional(professionalId, selectedCompanyId);
																setMyProducts(list || []);
															} catch (err) { setProductError(err.message || 'Erreur suppression'); }
														}}>Supprimer</button>
													</div>
												</div>
												) : (
													<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
														<div className="flex min-w-0 items-center gap-3">
															{getProductImageSrc(p) ? (
																<img src={getProductImageSrc(p)} alt={p.nomProduit ?? p.nom ?? p.name} className="h-14 w-14 flex-shrink-0 rounded-xl border border-neutral-200 object-cover" />
															) : (
																<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-400">Image</div>
															)}
													<div className="min-w-0">
															<div className="truncate font-semibold text-secondary-900">{p.nomProduit ?? p.nom ?? p.name}</div>
															<div className="mt-1 flex flex-wrap gap-2 text-sm text-secondary-600">
																<span>{(Number(p.prix) || 0).toFixed(2)} €</span>
																<span>•</span>
																<span>{p.unitaireOuKilo === 1 ? 'Unité' : 'Kilo'}</span>
																<span>•</span>
																<span>Stock: {p.stock ?? '—'}</span>
															</div>
															<div className="mt-2 flex flex-wrap gap-2">
																<span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">{p.nature ?? 'Autre'}</span>
																{Boolean(p.visible) ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Visible</span> : <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Masque</span>}
															</div>
															</div>
													</div>
													<div className="flex items-center gap-2">
														<button className="rounded-xl bg-secondary-100 px-4 py-2 text-sm font-semibold text-secondary-700 transition hover:bg-secondary-200" onClick={() => { setEditingId(p.idProduit || p.id); setEditingValues({ nomProduit: p.nomProduit ?? p.nom ?? p.name, prix: p.prix, stock: p.stock, visible: Boolean(p.visible), nature: p.nature ?? '' }); }}>Editer</button>
													</div>
												</div>
											)}
										</li>
															))}
											</ul>
										</div>
										<div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
											<form onSubmit={submitNewProduct} className="space-y-4">
									<div className="mb-4">
										<p className="text-sm font-semibold text-secondary-900">Ajouter un produit</p>
										<p className="text-xs text-secondary-500">
											Crée une nouvelle fiche produit pour {selectedCompany?.nom} avec image, stock et nature.
										</p>
									</div>
									{productError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{productError}</div> : null}
									<div className="grid grid-cols-1 gap-3">
										<div>
											<label className="block text-xs font-semibold text-neutral-700 mb-1">Nom du produit</label>
											<input className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800" value={newProduct.nomProduit} onChange={(e) => setNewProduct({...newProduct, nomProduit: e.target.value})} />
										</div>
										<div className="grid grid-cols-2 gap-3">
											<div>
												<label className="block text-xs font-semibold text-neutral-700 mb-1">Prix (€)</label>
												<input type="number" step="0.01" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800" value={newProduct.prix} onChange={(e) => setNewProduct({...newProduct, prix: e.target.value})} />
											</div>
											<div>
												<label className="block text-xs font-semibold text-neutral-700 mb-1">Stock</label>
												<input type="number" step="1" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} />
											</div>
										</div>

										<div className="grid grid-cols-2 gap-3 items-center">
											<label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-secondary-700">
												<input type="checkbox" className="h-4 w-4" checked={newProduct.unitaireOuKilo === 1} onChange={(e) => setNewProduct({...newProduct, unitaireOuKilo: e.target.checked ? 1 : 0})} />
												<span className="text-sm">Vendu à l'unité</span>
											</label>
											<label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-secondary-700">
												<input type="checkbox" className="h-4 w-4" checked={newProduct.bio === true || newProduct.bio === 1} onChange={(e) => setNewProduct({...newProduct, bio: e.target.checked ? 1 : 0})} />
												<span className="text-sm">Bio</span>
											</label>
										</div>

										<div className="grid grid-cols-2 gap-3">
											<div>
												<label className="block text-xs font-semibold text-neutral-700 mb-1">TVA (%)</label>
												<input type="number" step="0.1" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800" value={newProduct.tva} onChange={(e) => setNewProduct({...newProduct, tva: e.target.value})} />
											</div>
											<div>
												<label className="block text-xs font-semibold text-neutral-700 mb-1">Réduction pro (%)</label>
												<input type="number" step="0.1" className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800" value={newProduct.reductionPro} onChange={(e) => setNewProduct({...newProduct, reductionPro: e.target.value})} />
											</div>
										</div>

										<div>
											<label className="block text-xs font-semibold text-neutral-700 mb-1">Nature</label>
											<select className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800" value={newProduct.nature} onChange={(e) => setNewProduct({...newProduct, nature: e.target.value})}>
												<option value="Autre">Autre</option>
												<option value="Boulangerie">Boulangerie</option>
												<option value="Légume">Légume</option>
												<option value="Viande">Viande</option>
												<option value="Fruit">Fruit</option>
												<option value="Laitier">Laitier</option>
											</select>
										</div>

										<div>
											<label className="block text-xs font-semibold text-neutral-700 mb-1">Image produit</label>
											<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
												<input className="block w-full text-sm text-secondary-700 file:mr-4 file:rounded-xl file:border-0 file:bg-primary-100 file:px-4 file:py-2 file:font-semibold file:text-primary-700 hover:file:bg-primary-200" type="file" accept="image/*" onChange={(e) => setNewProduct({...newProduct, image: e.target.files && e.target.files[0] ? e.target.files[0] : null})} />
												{imagePreview ? (
													<img src={imagePreview} alt="preview" className="h-16 w-16 rounded-xl border border-neutral-200 object-cover" />
												) : (
													<div className="flex h-16 w-16 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-400">Aperçu</div>
												)}
											</div>
										</div>
									</div>

									<div className="flex items-center justify-end">
										<ActionButton type="submit" className="px-5 shadow-lg">Ajouter le produit</ActionButton>
									</div>
								</form>
							</div>
								</div>
								)}
							</SurfaceCard>
				<SurfaceCard className="col-span-12 border border-neutral-200 p-5">
					<DashboardPanelHeading eyebrow="Documents" title="Documents de commande" description="Factures telechargeables" />
					{recentOrders.length === 0 ? (
						<p className="text-sm text-secondary-600">Aucune commande recente pour generer des factures.</p>
					) : (
						<div className="space-y-2">
							{recentOrders.map((order) => (
								<div
									className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-[#fcfaf5] p-4 md:flex-row md:items-center md:justify-between"
									key={order.idCommande}
								>
									<div>
										<p className="font-semibold text-secondary-900">Commande #{order.idCommande}</p>
										<p className="text-sm text-secondary-600">
											{new Date(order.dateCommande).toLocaleDateString('fr-FR')} • {order.modeLivraison || 'non renseigne'} • {order.status}
										</p>
										<p className="mt-1 text-sm font-medium text-secondary-700">Total vendeur: {euro.format(order.total || 0)}</p>
									</div>
									<ActionButton className="h-10" onClick={() => downloadInvoice(order.idCommande)} type="button">
										Telecharger facture
									</ActionButton>
								</div>
							))}
						</div>
					)}
				</SurfaceCard>
		</PageShell>
	);
}
