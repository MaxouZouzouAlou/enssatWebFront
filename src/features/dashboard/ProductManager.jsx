import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActionButton } from '../../components/Button.jsx';
import SurfaceCard from '../../components/layout/SurfaceCard.jsx';
import {
	createProductForProfessional,
	deleteProductForProfessional,
	getProductsForProfessional,
	updateProductForProfessional,
} from '../../services/professionalProducts.js';
import { resolveProductImageUrl } from '../../utils/productMedia.js';
import { useToast } from '../../app/ToastProvider.jsx';
import { queryKeys } from '../../utils/queryKeys.js';

function getProductImageSrc(product) {
	return resolveProductImageUrl(
		product?.imagePath ?? product?.image ?? product?.path ?? product?.imageUrl ?? product?.imageData ?? null
	);
}

const NATURE_OPTIONS = ['Autre', 'Boulangerie', 'Légume', 'Viande', 'Fruit', 'Laitier'];

const EMPTY_NEW_PRODUCT = {
	nomProduit: '',
	prix: '',
	unitaireOuKilo: 1,
	stock: 0,
	nature: 'Autre',
	bio: false,
	tva: 0,
	reductionPro: 0,
	image: null,
};

function DashboardPanelHeading({ eyebrow, title, description }) {
	return (
		<div className="mb-4 flex flex-col gap-1">
			{eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-700">{eyebrow}</p> : null}
			<h2 className="text-2xl font-bold text-secondary-900">{title}</h2>
			{description ? <p className="text-sm text-secondary-600">{description}</p> : null}
		</div>
	);
}

export default function ProductManager({ professionalId, selectedCompanyId, selectedCompany, onProductMutated }) {
	const toast = useToast();
	const queryClient = useQueryClient();
	const [productError, setProductError] = useState('');
	const [newProduct, setNewProduct] = useState(EMPTY_NEW_PRODUCT);
	const [imagePreview, setImagePreview] = useState(null);
	const [editingId, setEditingId] = useState(null);
	const [editingValues, setEditingValues] = useState({});
	const [editingPreview, setEditingPreview] = useState(null);

	useEffect(() => {
		if (newProduct.image) {
			const url = URL.createObjectURL(newProduct.image);
			setImagePreview(url);
			return () => URL.revokeObjectURL(url);
		}
		setImagePreview(null);
	}, [newProduct.image]);

	useEffect(() => {
		if (editingValues.image) {
			const url = URL.createObjectURL(editingValues.image);
			setEditingPreview(url);
			return () => URL.revokeObjectURL(url);
		}
		setEditingPreview(null);
	}, [editingValues.image]);

	const productsQuery = useQuery({
		queryKey: queryKeys.products.professionalList(professionalId, selectedCompanyId),
		queryFn: () => getProductsForProfessional(professionalId, selectedCompanyId),
		enabled: Boolean(professionalId && selectedCompanyId),
	});

	const refreshProducts = async () => {
		await queryClient.invalidateQueries({
			queryKey: queryKeys.products.professionalList(professionalId, selectedCompanyId),
		});
		await onProductMutated?.();
	};

	const createProductMutation = useMutation({
		mutationFn: (payload) => createProductForProfessional(professionalId, payload, selectedCompanyId),
		onSuccess: refreshProducts,
	});
	const updateProductMutation = useMutation({
		mutationFn: ({ productId, payload }) =>
			updateProductForProfessional(professionalId, productId, payload, selectedCompanyId),
		onSuccess: refreshProducts,
	});
	const deleteProductMutation = useMutation({
		mutationFn: (productId) => deleteProductForProfessional(professionalId, productId, selectedCompanyId),
		onSuccess: refreshProducts,
	});

	const submitNewProduct = async (e) => {
		e.preventDefault();
		try {
			await createProductMutation.mutateAsync(newProduct);
			setNewProduct(EMPTY_NEW_PRODUCT);
			toast.showSuccess('Produit ajouté au catalogue.');
		} catch (err) {
			const message = err.message || 'Erreur création produit';
			setProductError(message);
			toast.showError(message);
		}
	};

	const myProducts = productsQuery.data || [];
	const loading = productsQuery.isLoading;
	const currentProductError = productError || productsQuery.error?.message || '';

	return (
		<SurfaceCard className="col-span-12 border border-neutral-200 bg-[linear-gradient(180deg,#fffefb_0%,#f7f3ea_100%)] p-5 xl:col-span-12">
			<DashboardPanelHeading
				eyebrow="Catalogue"
				title="Mes produits en vente"
				description="Gérez vos produits et ajoutez-en de nouveaux"
			/>
			{loading ? (
				<div className="text-sm text-secondary-600">Chargement des produits...</div>
			) : currentProductError ? (
				<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
					Erreur: {currentProductError}
				</div>
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
								<li className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-secondary-600">
									Aucun produit publié.
								</li>
							) : myProducts.map((p) => (
								<li key={p.idProduit ?? p.id} className="rounded-2xl border border-neutral-200 bg-[#fcfaf5] p-4 shadow-sm">
									{editingId === (p.idProduit || p.id) ? (
										<div className="grid gap-3">
											<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
												{editingPreview || getProductImageSrc(p) ? (
													<img
														src={editingPreview || getProductImageSrc(p)}
														alt={p.nomProduit ?? p.nom ?? p.name}
														className="h-16 w-16 rounded-xl border border-neutral-200 object-cover"
													/>
												) : (
													<div className="flex h-16 w-16 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-400">
														Image
													</div>
												)}
												<input
													className="block w-full text-sm text-secondary-700 file:mr-4 file:rounded-xl file:border-0 file:bg-primary-100 file:px-4 file:py-2 file:font-semibold file:text-primary-700 hover:file:bg-primary-200"
													type="file"
													accept="image/*"
													onChange={(e) =>
														setEditingValues({
															...editingValues,
															image: e.target.files?.[0] ?? null,
														})
													}
												/>
											</div>
											<input
												className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800"
												value={editingValues.nomProduit ?? editingValues.nom ?? p.nomProduit ?? p.nom ?? ''}
												onChange={(e) => setEditingValues({ ...editingValues, nomProduit: e.target.value })}
											/>
											<div className="grid gap-3 md:grid-cols-3">
												<input
													type="number"
													step="0.01"
													className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800"
													value={editingValues.prix ?? p.prix}
													onChange={(e) => setEditingValues({ ...editingValues, prix: e.target.value })}
												/>
												<input
													type="number"
													step="1"
													className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800"
													value={editingValues.stock ?? p.stock}
													onChange={(e) => setEditingValues({ ...editingValues, stock: e.target.value })}
												/>
												<label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-secondary-700">
													<input
														type="checkbox"
														checked={editingValues.visible ?? Boolean(p.visible)}
														onChange={(e) => setEditingValues({ ...editingValues, visible: e.target.checked })}
													/>
													Visible
												</label>
											</div>
											<div>
												<label className="mb-1 block text-xs font-semibold text-neutral-700">Nature</label>
												<select
													className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800"
													value={editingValues.nature ?? p.nature ?? 'Autre'}
													onChange={(e) => setEditingValues({ ...editingValues, nature: e.target.value })}
												>
													{NATURE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
												</select>
											</div>
											<div className="flex flex-wrap justify-end gap-2">
												<button
													type="button"
													className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-300"
													onClick={() => { setEditingId(null); setEditingValues({}); }}
												>
													Annuler
												</button>
												<button
													type="button"
													className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
													onClick={async () => {
														try {
															await updateProductMutation.mutateAsync({
																productId: p.idProduit || p.id,
																payload: editingValues,
															});
															setEditingId(null);
															setEditingValues({});
															toast.showSuccess('Produit mis à jour.');
														} catch (err) {
															const message = err.message || 'Erreur mise à jour';
															setProductError(message);
															toast.showError(message);
														}
													}}
												>
													Sauvegarder
												</button>
												<button
													type="button"
													className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
													onClick={async () => {
														if (!window.confirm('Supprimer ce produit ?')) return;
														try {
															await deleteProductMutation.mutateAsync(p.idProduit || p.id);
															toast.showSuccess('Produit supprimé.');
														} catch (err) {
															const message = err.message || 'Erreur suppression';
															setProductError(message);
															toast.showError(message);
														}
													}}
												>
													Supprimer
												</button>
											</div>
										</div>
									) : (
										<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
											<div className="flex min-w-0 items-center gap-3">
												{getProductImageSrc(p) ? (
													<img
														src={getProductImageSrc(p)}
														alt={p.nomProduit ?? p.nom ?? p.name}
														className="h-14 w-14 flex-shrink-0 rounded-xl border border-neutral-200 object-cover"
													/>
												) : (
													<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-400">
														Image
													</div>
												)}
												<div className="min-w-0">
													<div className="truncate font-semibold text-secondary-900">
														{p.nomProduit ?? p.nom ?? p.name}
													</div>
													<div className="mt-1 flex flex-wrap gap-2 text-sm text-secondary-600">
														<span>{(Number(p.prix) || 0).toFixed(2)} €</span>
														<span>•</span>
														<span>{p.unitaireOuKilo === 1 ? 'Unité' : 'Kilo'}</span>
														<span>•</span>
														<span>Stock: {p.stock ?? '—'}</span>
													</div>
													<div className="mt-2 flex flex-wrap gap-2">
														<span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
															{p.nature ?? 'Autre'}
														</span>
														{Boolean(p.visible) ? (
															<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
																Visible
															</span>
														) : (
															<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
																Masqué
															</span>
														)}
													</div>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<button
													className="rounded-xl bg-secondary-100 px-4 py-2 text-sm font-semibold text-secondary-700 transition hover:bg-secondary-200"
													onClick={() => {
														setEditingId(p.idProduit || p.id);
														setEditingValues({
															nomProduit: p.nomProduit ?? p.nom ?? p.name,
															prix: p.prix,
															stock: p.stock,
															visible: Boolean(p.visible),
															nature: p.nature ?? '',
														});
													}}
												>
													Éditer
												</button>
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
							{currentProductError ? (
								<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
									{currentProductError}
								</div>
							) : null}
							<div className="grid grid-cols-1 gap-3">
								<div>
									<label className="mb-1 block text-xs font-semibold text-neutral-700">Nom du produit</label>
									<input
										className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800"
										value={newProduct.nomProduit}
										onChange={(e) => setNewProduct({ ...newProduct, nomProduit: e.target.value })}
									/>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="mb-1 block text-xs font-semibold text-neutral-700">Prix (€)</label>
										<input
											type="number"
											step="0.01"
											className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800"
											value={newProduct.prix}
											onChange={(e) => setNewProduct({ ...newProduct, prix: e.target.value })}
										/>
									</div>
									<div>
										<label className="mb-1 block text-xs font-semibold text-neutral-700">Stock</label>
										<input
											type="number"
											step="1"
											className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800"
											value={newProduct.stock}
											onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-3 items-center">
									<label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-secondary-700">
										<input
											type="checkbox"
											className="h-4 w-4"
											checked={newProduct.unitaireOuKilo === 1}
											onChange={(e) => setNewProduct({ ...newProduct, unitaireOuKilo: e.target.checked ? 1 : 0 })}
										/>
										<span className="text-sm">Vendu à l'unité</span>
									</label>
									<label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-secondary-700">
										<input
											type="checkbox"
											className="h-4 w-4"
											checked={newProduct.bio === true || newProduct.bio === 1}
											onChange={(e) => setNewProduct({ ...newProduct, bio: e.target.checked ? 1 : 0 })}
										/>
										<span className="text-sm">Bio</span>
									</label>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="mb-1 block text-xs font-semibold text-neutral-700">TVA (%)</label>
										<input
											type="number"
											step="0.1"
											className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800"
											value={newProduct.tva}
											onChange={(e) => setNewProduct({ ...newProduct, tva: e.target.value })}
										/>
									</div>
									<div>
										<label className="mb-1 block text-xs font-semibold text-neutral-700">Réduction pro (%)</label>
										<input
											type="number"
											step="0.1"
											className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800"
											value={newProduct.reductionPro}
											onChange={(e) => setNewProduct({ ...newProduct, reductionPro: e.target.value })}
										/>
									</div>
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-neutral-700">Nature</label>
									<select
										className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-secondary-800"
										value={newProduct.nature}
										onChange={(e) => setNewProduct({ ...newProduct, nature: e.target.value })}
									>
										{NATURE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
									</select>
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-neutral-700">Image produit</label>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
										<input
											className="block w-full text-sm text-secondary-700 file:mr-4 file:rounded-xl file:border-0 file:bg-primary-100 file:px-4 file:py-2 file:font-semibold file:text-primary-700 hover:file:bg-primary-200"
											type="file"
											accept="image/*"
											onChange={(e) =>
												setNewProduct({
													...newProduct,
													image: e.target.files?.[0] ?? null,
												})
											}
										/>
										{imagePreview ? (
											<img src={imagePreview} alt="preview" className="h-16 w-16 rounded-xl border border-neutral-200 object-cover" />
										) : (
											<div className="flex h-16 w-16 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-400">
												Aperçu
											</div>
										)}
									</div>
								</div>
							</div>
							<div className="flex items-center justify-end">
								<ActionButton type="submit" className="px-5 shadow-lg">
									Ajouter le produit
								</ActionButton>
							</div>
						</form>
					</div>
				</div>
			)}
		</SurfaceCard>
	);
}
