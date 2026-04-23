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

export default function ProfessionalDashboard({
	accountType = 'particulier',
	professionalId,
	professionalCompanies = [],
	selectedCompany = null,
	onSelectCompany
}) {
	const isProfessional = accountType === 'professionnel' || accountType === 'pro';
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
		await createProductForProfessional(professionalId, newProduct);
		const list = await getProductsForProfessional(professionalId);
		setMyProducts(list || []);
		setNewProduct({ nomProduit: '', prix: '', unitaireOuKilo: 1, stock: 0, nature: 'Autre', bio: false, tva: 0, reductionPro: 0, image: null });
	} catch (err) {
		setProductError(err.message || 'Erreur creation produit');
	}
};

useEffect(() => {
    if (!isProfessional || !professionalId) return;
    let ignore = false;
    setLoadingProducts(true);
    setProductError('');
    getProductsForProfessional(professionalId)
        .then((data) => { if (!ignore) setMyProducts(data || []); })
        .catch((err) => { if (!ignore) setProductError(err.message || 'Erreur'); })
        .finally(() => { if (!ignore) setLoadingProducts(false); });
    return () => { ignore = true; };
}, [isProfessional, professionalId]);

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

	const downloadSalesReport = async () => {
		if (!professionalId) return;
		setDocumentMessage('');
		try {
			await downloadProfessionalSalesReport(professionalId, 90);
			setDocumentMessage('Rapport des ventes telecharge.');
		} catch (err) {
			setDocumentMessage(err.message || 'Impossible de telecharger le rapport.');
		}
	};

	const downloadInvoice = async (idCommande) => {
		if (!professionalId) return;
		setDocumentMessage('');
		try {
			await downloadOrderInvoice(professionalId, idCommande);
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


	const downloadSalesReport = async () => {
		if (!professionalId) return;
		setDocumentMessage('');
		try {
			await downloadProfessionalSalesReport(professionalId, 90);
			setDocumentMessage('Rapport des ventes telecharge.');
		} catch (err) {
			setDocumentMessage(err.message || 'Impossible de telecharger le rapport.');
		}
	};

	const downloadInvoice = async (idCommande) => {
		if (!professionalId) return;
		setDocumentMessage('');
		try {
			await downloadOrderInvoice(professionalId, idCommande);
			setDocumentMessage(`Facture PDF commande #${idCommande} telechargee.`);
		} catch (err) {
			setDocumentMessage(err.message || 'Impossible de telecharger cette facture.');
		}
	};

	return (
		<PageShell contentClassName="grid grid-cols-12 gap-5">
			<header className="col-span-12 flex flex-col justify-between gap-4 md:flex-row md:items-start">
				<SectionHeader eyebrow="Espace pro" title="Dashboard professionnel">
					<p>
						Suivez vos performances en temps reel: chiffre d affaires, commandes,
						produits les plus vendus et habitudes d achat.
					</p>
					{selectedCompany ? (
						<p className="mt-2 text-sm text-secondary-700">
							Entreprise active: <strong>{selectedCompany.nom}</strong> · SIRET {selectedCompany.siret}
						</p>
					) : null}
					{loading ? <p className="mt-2 text-sm text-neutral-600">Chargement du dashboard...</p> : null}
					{error ? <p className="mt-2 text-sm font-semibold text-red-700">{error}</p> : null}
					{documentMessage ? <p className="mt-2 text-sm font-semibold text-primary-700">{documentMessage}</p> : null}
				</SectionHeader>
			<div className="flex w-full max-w-md flex-col gap-3 md:w-auto">
				<ProfessionalCompanySwitcher
					companies={professionalCompanies}
					onSelectCompany={onSelectCompany}
					selectedCompanyId={selectedCompany?.id}
					title="Entreprise suivie"
				/>
				<ActionButton className="h-12 px-5" onClick={downloadSalesReport} type="button">
					Telecharger rapport ventes (CSV)
				</ActionButton>
			</div>

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

				<SurfaceCard className="col-span-12 p-4 xl:col-span-12">
					<div className="mb-3 flex items-end justify-between gap-3">
						<h2 className="text-2xl font-bold">Mes produits en vente</h2>
						<p className="text-sm text-neutral-600">Gerez vos produits et ajoutez-en de nouveaux</p>
					</div>
					{loadingProducts ? (
						<div className="text-sm text-neutral-600">Chargement des produits...</div>
					) : productError ? (
						<div className="text-sm text-red-600">Erreur: {productError}</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<ul className="space-y-3">
									{myProducts.length === 0 ? (
										<li className="text-gray-600">Aucun produit publié.</li>
									) : myProducts.map((p) => (
										<li key={p.idProduit ?? p.id} className="border rounded p-3">
											{editingId === (p.idProduit || p.id) ? (
												<div className="grid gap-2">
													<div className="flex items-center gap-3">
														{editingPreview || p.imageData ? (
															<img src={editingPreview || p.imageData} alt={p.nomProduit ?? p.nom ?? p.name} className="h-12 w-12 object-cover rounded-md border" />
														) : (
															<div className="h-12 w-12 rounded-md bg-neutral-50 border flex items-center justify-center text-xs text-neutral-400">Image</div>
														)}
												<input type="file" accept="image/*" onChange={(e) => setEditingValues({...editingValues, image: e.target.files && e.target.files[0] ? e.target.files[0] : null})} />
													</div>
													<input className="w-full border rounded px-2 py-1" value={editingValues.nomProduit ?? editingValues.nom ?? p.nomProduit ?? p.nom ?? ''} onChange={(e) => setEditingValues({...editingValues, nomProduit: e.target.value})} />
													<div className="grid grid-cols-3 gap-2">
														<input type="number" step="0.01" className="border rounded px-2 py-1" value={editingValues.prix ?? p.prix} onChange={(e) => setEditingValues({...editingValues, prix: e.target.value})} />
														<input type="number" step="1" className="border rounded px-2 py-1" value={editingValues.stock ?? p.stock} onChange={(e) => setEditingValues({...editingValues, stock: e.target.value})} />
														<label className="flex items-center gap-2"><input type="checkbox" checked={editingValues.visible ?? Boolean(p.visible)} onChange={(e) => setEditingValues({...editingValues, visible: e.target.checked})} /> Visible</label>
													</div>
													<div>
														<label className="block text-xs font-semibold text-neutral-700 mb-1">Nature</label>
														<select className="w-full border border-neutral-200 rounded px-2 py-1" value={editingValues.nature ?? p.nature ?? 'Autre'} onChange={(e) => setEditingValues({...editingValues, nature: e.target.value})}>
															<option value="Autre">Autre</option>
															<option value="Boulangerie">Boulangerie</option>
															<option value="Légume">Légume</option>
															<option value="Viande">Viande</option>
															<option value="Fruit">Fruit</option>
															<option value="Laitier">Laitier</option>
														</select>
													</div>
													<div className="flex gap-2 justify-end">
														<button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => { setEditingId(null); setEditingValues({}); }}>Annuler</button>
														<button type="button" className="px-3 py-1 bg-green-600 text-white rounded" onClick={async () => {
															try {
																await updateProductForProfessional(professionalId, p.idProduit || p.id, editingValues);
																const list = await getProductsForProfessional(professionalId);
																setMyProducts(list || []);
																setEditingId(null);
															} catch (err) { setProductError(err.message || 'Erreur mise à jour'); }
														}}>Sauvegarder</button>
														<button type="button" className="px-3 py-1 bg-red-600 text-white rounded" onClick={async () => {
															if (!window.confirm('Supprimer ce produit ?')) return;
															try {
																await deleteProductForProfessional(professionalId, p.idProduit || p.id);
																const list = await getProductsForProfessional(professionalId);
																setMyProducts(list || []);
															} catch (err) { setProductError(err.message || 'Erreur suppression'); }
														}}>Supprimer</button>
													</div>
												</div>
											) : (
												<div className="flex items-center justify-between gap-3">
													<div className="flex items-center gap-3 min-w-0">
														{p.imageData ? (
															<img src={p.imageData} alt={p.nomProduit ?? p.nom ?? p.name} className="h-12 w-12 object-cover rounded-md border flex-shrink-0" />
														) : (
															<div className="h-12 w-12 rounded-md bg-neutral-50 border flex items-center justify-center text-xs text-neutral-400 flex-shrink-0">Image</div>
														)}
													<div className="min-w-0">
															<div className="font-medium text-green-800 truncate">{p.nomProduit ?? p.nom ?? p.name}</div>
															<div className="text-sm text-gray-600 truncate">{(Number(p.prix) || 0).toFixed(2)} € — {p.unitaireOuKilo === 1 ? 'Unité' : 'Kilo'}</div>
															</div>
													</div>
													<div className="flex items-center gap-2">
														<div className="text-sm text-gray-600">Stock: {p.stock ?? '—'}</div>
														<button className="px-3 py-1 bg-gray-100 rounded" onClick={() => { setEditingId(p.idProduit || p.id); setEditingValues({ nomProduit: p.nomProduit ?? p.nom ?? p.name, prix: p.prix, stock: p.stock, visible: Boolean(p.visible), nature: p.nature ?? '' }); }}>Editer</button>
													</div>
												</div>
											)}
										</li>
									))}
								</ul>
							</div>
							<div>
								<form onSubmit={submitNewProduct} className="bg-white p-4 rounded-lg shadow-sm space-y-4">
									{productError ? <div className="text-sm text-red-600">{productError}</div> : null}
									<div className="grid grid-cols-1 gap-3">
										<div>
											<label className="block text-xs font-semibold text-neutral-700 mb-1">Nom du produit</label>
											<input className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm" value={newProduct.nomProduit} onChange={(e) => setNewProduct({...newProduct, nomProduit: e.target.value})} />
										</div>
										<div className="grid grid-cols-2 gap-3">
											<div>
												<label className="block text-xs font-semibold text-neutral-700 mb-1">Prix (€)</label>
												<input type="number" step="0.01" className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm" value={newProduct.prix} onChange={(e) => setNewProduct({...newProduct, prix: e.target.value})} />
											</div>
											<div>
												<label className="block text-xs font-semibold text-neutral-700 mb-1">Stock</label>
												<input type="number" step="1" className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} />
											</div>
										</div>

										<div className="grid grid-cols-2 gap-3 items-center">
											<label className="flex items-center gap-2 text-sm">
												<input type="checkbox" className="h-4 w-4" checked={newProduct.unitaireOuKilo === 1} onChange={(e) => setNewProduct({...newProduct, unitaireOuKilo: e.target.checked ? 1 : 0})} />
												<span className="text-sm text-neutral-700">Vendu à l'unité</span>
											</label>
											<label className="flex items-center gap-2 text-sm">
												<input type="checkbox" className="h-4 w-4" checked={newProduct.bio === true || newProduct.bio === 1} onChange={(e) => setNewProduct({...newProduct, bio: e.target.checked ? 1 : 0})} />
												<span className="text-sm text-neutral-700">Bio</span>
											</label>
										</div>

										<div className="grid grid-cols-2 gap-3">
											<div>
												<label className="block text-xs font-semibold text-neutral-700 mb-1">TVA (%)</label>
												<input type="number" step="0.1" className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm" value={newProduct.tva} onChange={(e) => setNewProduct({...newProduct, tva: e.target.value})} />
											</div>
											<div>
												<label className="block text-xs font-semibold text-neutral-700 mb-1">Réduction pro (%)</label>
												<input type="number" step="0.1" className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm" value={newProduct.reductionPro} onChange={(e) => setNewProduct({...newProduct, reductionPro: e.target.value})} />
											</div>
										</div>

										<div>
											<label className="block text-xs font-semibold text-neutral-700 mb-1">Nature</label>
											<select className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm" value={newProduct.nature} onChange={(e) => setNewProduct({...newProduct, nature: e.target.value})}>
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
											<div className="flex items-center gap-3">
												<input type="file" accept="image/*" onChange={(e) => setNewProduct({...newProduct, image: e.target.files && e.target.files[0] ? e.target.files[0] : null})} />
												{imagePreview ? (
													<img src={imagePreview} alt="preview" className="h-16 w-16 object-cover rounded-md border" />
												) : (
													<div className="h-16 w-16 rounded-md bg-neutral-50 border flex items-center justify-center text-sm text-neutral-400">Aperçu</div>
												)}
											</div>
										</div>
									</div>

									<div className="flex items-center justify-end">
										<ActionButton type="submit" className="px-5">Ajouter le produit</ActionButton>
									</div>
								</form>
							</div>
				<SurfaceCard className="col-span-12 p-4">
					<div className="mb-3 flex items-end justify-between gap-3">
						<h2 className="text-2xl font-bold">Documents de commande</h2>
						<p className="text-sm text-neutral-600">Factures telechargeables</p>
					</div>
					{recentOrders.length === 0 ? (
						<p className="text-sm text-neutral-600">Aucune commande recente pour generer des factures.</p>
					) : (
						<div className="space-y-2">
							{recentOrders.map((order) => (
								<div
									className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-3 md:flex-row md:items-center md:justify-between"
									key={order.idCommande}
								>
									<div>
										<p className="font-semibold text-secondary-900">Commande #{order.idCommande}</p>
										<p className="text-sm text-neutral-600">
											{new Date(order.dateCommande).toLocaleDateString('fr-FR')} • {order.modeLivraison || 'non renseigne'} • {order.status}
										</p>
										<p className="text-sm text-neutral-700">Total vendeur: {euro.format(order.total || 0)}</p>
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
