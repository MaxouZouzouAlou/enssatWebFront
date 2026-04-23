import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ActionButton } from '../components/Button.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SoftPanel from '../components/layout/SoftPanel.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import {
	deleteAdminAccount,
	deleteAdminCompany,
	deleteAdminProduct,
	fetchAdminAccounts,
	fetchAdminCompanies,
	fetchAdminOverview,
	fetchAdminProducts,
	updateAdminProductVisibility
} from '../services/superadmin-client.js';
import { queryKeys } from '../utils/queryKeys.js';

function MetricCard({ label, value }) {
	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-4">
			<p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">{label}</p>
			<p className="mt-2 text-2xl font-semibold text-secondary-900">{value}</p>
		</div>
	);
}

export default function SuperAdminPage() {
	const [error, setError] = useState('');
	const [busyKey, setBusyKey] = useState('');
	const queryClient = useQueryClient();

	const overviewQuery = useQuery({
		queryKey: queryKeys.superadmin.overview,
		queryFn: fetchAdminOverview,
	});
	const accountsQuery = useQuery({
		queryKey: queryKeys.superadmin.accounts,
		queryFn: fetchAdminAccounts,
	});
	const companiesQuery = useQuery({
		queryKey: queryKeys.superadmin.companies,
		queryFn: fetchAdminCompanies,
	});
	const productsQuery = useQuery({
		queryKey: queryKeys.superadmin.products,
		queryFn: fetchAdminProducts,
	});

	const overview = overviewQuery.data || null;
	const accounts = Array.isArray(accountsQuery.data) ? accountsQuery.data : [];
	const companies = Array.isArray(companiesQuery.data) ? companiesQuery.data : [];
	const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
	const loading = overviewQuery.isLoading || accountsQuery.isLoading || companiesQuery.isLoading || productsQuery.isLoading;
	const queryError = overviewQuery.error || accountsQuery.error || companiesQuery.error || productsQuery.error;

	const refreshAdminData = async () => {
		await queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.all });
	};

	const runAction = async (key, action) => {
		setBusyKey(key);
		setError('');
		try {
			await action();
			await refreshAdminData();
		} catch (actionError) {
			setError(actionError.message || 'Action admin impossible.');
		} finally {
			setBusyKey('');
		}
	};

	return (
		<PageShell contentClassName="max-w-7xl">
			<SectionHeader eyebrow="Superadmin" title="Administration globale">
				<p>Gérez les comptes, les entreprises et les produits de la plateforme depuis un espace réservé au super administrateur.</p>
			</SectionHeader>

			<div className="mt-6 flex justify-end">
				<ActionButton type="button" loading={loading} onClick={refreshAdminData} className="h-10">
					Actualiser
				</ActionButton>
			</div>

			{queryError && !error ? <p className="mt-4 text-sm font-semibold text-red-700">{queryError.message || "Impossible de charger l'espace superadmin."}</p> : null}
			{error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

			<div className="mt-6 grid gap-4 sm:grid-cols-3">
				<MetricCard label="Comptes" value={overview?.accounts ?? '-'} />
				<MetricCard label="Entreprises" value={overview?.companies ?? '-'} />
				<MetricCard label="Produits" value={overview?.products ?? '-'} />
			</div>

			<div className="mt-8 grid gap-6">
				<SurfaceCard className="p-5">
					<SoftPanel className="p-5">
						<h2 className="text-xl font-semibold text-secondary-900">Comptes</h2>
						<p className="mt-1 text-sm text-neutral-600">Suppression possible sur les comptes hors superadmin. Les comptes professionnels emportent aussi leurs entreprises et produits.</p>
						<div className="mt-4 overflow-x-auto">
							<table className="min-w-full text-left text-sm">
								<thead className="text-neutral-500">
									<tr>
										<th className="pb-3 pr-4">Email</th>
										<th className="pb-3 pr-4">Type</th>
										<th className="pb-3 pr-4">Entreprises</th>
										<th className="pb-3 pr-4">Produits</th>
										<th className="pb-3">Action</th>
									</tr>
								</thead>
								<tbody>
									{accounts.map((account) => (
										<tr key={account.id} className="border-t border-neutral-200">
											<td className="py-3 pr-4">
												<p className="font-semibold text-secondary-900">{account.email}</p>
												<p className="text-xs text-neutral-500">{account.name || `${account.firstName || ''} ${account.lastName || ''}`.trim() || 'Sans nom'}</p>
											</td>
											<td className="py-3 pr-4">{account.accountType}</td>
											<td className="py-3 pr-4">{account.companyCount}</td>
											<td className="py-3 pr-4">{account.productCount}</td>
											<td className="py-3">
												{account.accountType === 'superadmin' ? (
													<span className="text-xs font-semibold text-neutral-500">Protege</span>
												) : (
													<ActionButton
														type="button"
														variant="danger"
														className="h-9"
														loading={busyKey === `account-${account.id}`}
														onClick={() => {
															if (!window.confirm(`Supprimer le compte ${account.email} ?`)) return;
															runAction(`account-${account.id}`, () => deleteAdminAccount(account.id));
														}}
													>
														Supprimer le compte
													</ActionButton>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</SoftPanel>
				</SurfaceCard>

				<SurfaceCard className="p-5">
					<SoftPanel className="p-5">
						<h2 className="text-xl font-semibold text-secondary-900">Entreprises</h2>
						<p className="mt-1 text-sm text-neutral-600">La suppression est destructive et emporte les produits et données rattachés.</p>
						<div className="mt-4 overflow-x-auto">
							<table className="min-w-full text-left text-sm">
								<thead className="text-neutral-500">
									<tr>
										<th className="pb-3 pr-4">Entreprise</th>
										<th className="pb-3 pr-4">SIRET</th>
										<th className="pb-3 pr-4">Produits</th>
										<th className="pb-3 pr-4">Pros liés</th>
										<th className="pb-3">Action</th>
									</tr>
								</thead>
								<tbody>
									{companies.map((company) => (
										<tr key={company.id} className="border-t border-neutral-200">
											<td className="py-3 pr-4">
												<p className="font-semibold text-secondary-900">{company.nom}</p>
												<p className="text-xs text-neutral-500">{[company.adresse_ligne, company.code_postal, company.ville].filter(Boolean).join(', ')}</p>
											</td>
											<td className="py-3 pr-4">{company.siret}</td>
											<td className="py-3 pr-4">{company.productCount}</td>
											<td className="py-3 pr-4">{company.professionalCount}</td>
											<td className="py-3">
												<ActionButton
													type="button"
													variant="danger"
													className="h-9"
													loading={busyKey === `company-${company.id}`}
													onClick={() => {
														if (!window.confirm(`Supprimer l'entreprise ${company.nom} ?`)) return;
														runAction(`company-${company.id}`, () => deleteAdminCompany(company.id));
													}}
												>
													Supprimer l'entreprise
												</ActionButton>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</SoftPanel>
				</SurfaceCard>

				<SurfaceCard className="p-5">
					<SoftPanel className="p-5">
						<h2 className="text-xl font-semibold text-secondary-900">Produits</h2>
						<p className="mt-1 text-sm text-neutral-600">Vous pouvez masquer/afficher un produit ou le supprimer définitivement.</p>
						<div className="mt-4 overflow-x-auto">
							<table className="min-w-full text-left text-sm">
								<thead className="text-neutral-500">
									<tr>
										<th className="pb-3 pr-4">Produit</th>
										<th className="pb-3 pr-4">Entreprise</th>
										<th className="pb-3 pr-4">Prix</th>
										<th className="pb-3 pr-4">Stock</th>
										<th className="pb-3 pr-4">Visible</th>
										<th className="pb-3">Actions</th>
									</tr>
								</thead>
								<tbody>
									{products.map((product) => (
										<tr key={product.idProduit} className="border-t border-neutral-200">
											<td className="py-3 pr-4">
												<p className="font-semibold text-secondary-900">{product.nom}</p>
												<p className="text-xs text-neutral-500">
													{product.professionnelPrenom} {product.professionnelNom}
												</p>
											</td>
											<td className="py-3 pr-4">{product.entrepriseNom || 'Sans entreprise'}</td>
											<td className="py-3 pr-4">{Number(product.prix || 0).toFixed(2)} €</td>
											<td className="py-3 pr-4">{product.stock}</td>
											<td className="py-3 pr-4">{product.visible ? 'Oui' : 'Non'}</td>
											<td className="py-3">
												<div className="flex gap-2">
													<ActionButton
														type="button"
														variant="secondary"
														className="h-9"
														loading={busyKey === `product-visibility-${product.idProduit}`}
														onClick={() => runAction(
															`product-visibility-${product.idProduit}`,
															() => updateAdminProductVisibility(product.idProduit, !product.visible)
														)}
													>
														{product.visible ? 'Masquer' : 'Afficher'}
													</ActionButton>
													<ActionButton
														type="button"
														variant="danger"
														className="h-9"
														loading={busyKey === `product-delete-${product.idProduit}`}
														onClick={() => {
															if (!window.confirm(`Supprimer le produit ${product.nom} ?`)) return;
															runAction(`product-delete-${product.idProduit}`, () => deleteAdminProduct(product.idProduit));
														}}
													>
														Supprimer le produit
													</ActionButton>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</SoftPanel>
				</SurfaceCard>
			</div>
		</PageShell>
	);
}
