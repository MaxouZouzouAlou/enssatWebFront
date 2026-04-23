import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AddressAutocompleteInput from '../address/AddressAutocompleteInput.jsx';
import {
	attachCompanySalesPoint,
	createCompanySalesPoint,
	detachCompanySalesPoint,
	fetchCompanySalesPoints
} from '../../services/professionalSalesPoints.js';
import { useToast } from '../../app/ToastProvider.jsx';
import { queryKeys } from '../../utils/queryKeys.js';

function formatAddress(salesPoint) {
	const address = salesPoint?.adresse;
	if (!address) return '';
	return [address.ligne, address.codePostal, address.ville].filter(Boolean).join(', ');
}

const EMPTY_FORM = {
	nom: '',
	horaires: '',
	adresse_ligne: '',
	code_postal: '',
	ville: ''
};

export default function CompanySalesPointsManager({ professionalId, selectedCompany }) {
	const toast = useToast();
	const queryClient = useQueryClient();
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const [selectedExistingId, setSelectedExistingId] = useState('');
	const [creating, setCreating] = useState(false);
	const [attaching, setAttaching] = useState(false);
	const [detachingId, setDetachingId] = useState(null);
	const [newSalesPoint, setNewSalesPoint] = useState(() => ({
		...EMPTY_FORM,
		adresse_ligne: selectedCompany?.adresse_ligne || '',
		code_postal: selectedCompany?.code_postal || '',
		ville: selectedCompany?.ville || ''
	}));

	useEffect(() => {
		setNewSalesPoint({
			...EMPTY_FORM,
			adresse_ligne: selectedCompany.adresse_ligne || '',
			code_postal: selectedCompany.code_postal || '',
			ville: selectedCompany.ville || ''
		});

	}, [professionalId, selectedCompany]);

	const salesPointsQuery = useQuery({
		queryKey: queryKeys.salesPoints.company(professionalId, selectedCompany?.id),
		queryFn: () => fetchCompanySalesPoints(professionalId, selectedCompany.id),
		enabled: Boolean(professionalId && selectedCompany?.id),
	});

	useEffect(() => {
		if (salesPointsQuery.error) {
			setError(salesPointsQuery.error.message || 'Impossible de charger les points de vente.');
			return;
		}
		setError('');
	}, [salesPointsQuery.error]);

	const data = salesPointsQuery.data || { currentSalesPoints: [], availableSalesPoints: [] };
	const loading = salesPointsQuery.isLoading;

	useEffect(() => {
		setSelectedExistingId((data.availableSalesPoints || [])[0]?.idLieu ? String(data.availableSalesPoints[0].idLieu) : '');
	}, [data.availableSalesPoints]);

	const refreshSalesPoints = async () => {
		await queryClient.invalidateQueries({ queryKey: queryKeys.salesPoints.company(professionalId, selectedCompany?.id) });
	};

	const attachMutation = useMutation({
		mutationFn: (idLieu) => attachCompanySalesPoint(professionalId, selectedCompany.id, idLieu),
		onSuccess: refreshSalesPoints,
	});
	const createMutation = useMutation({
		mutationFn: (payload) => createCompanySalesPoint(professionalId, selectedCompany.id, payload),
		onSuccess: refreshSalesPoints,
	});
	const detachMutation = useMutation({
		mutationFn: (idLieu) => detachCompanySalesPoint(professionalId, selectedCompany.id, idLieu),
		onSuccess: refreshSalesPoints,
	});

	const handleAttach = async () => {
		if (!selectedExistingId) return;
		setAttaching(true);
		setError('');
		setMessage('');
		try {
			await attachMutation.mutateAsync(Number(selectedExistingId));
			setMessage('Point de vente rattaché.');
			toast.showSuccess('Point de vente rattaché.');
		} catch (err) {
			const message = err.message || 'Impossible de rattacher ce point de vente.';
			setError(message);
			toast.showError(message);
		} finally {
			setAttaching(false);
		}
	};

	const handleCreate = async (event) => {
		event.preventDefault();
		setCreating(true);
		setError('');
		setMessage('');
		try {
			await createMutation.mutateAsync(newSalesPoint);
			setNewSalesPoint({
				...EMPTY_FORM,
				adresse_ligne: selectedCompany.adresse_ligne || '',
				code_postal: selectedCompany.code_postal || '',
				ville: selectedCompany.ville || ''
			});
			setMessage('Nouveau point de vente créé et rattaché.');
			toast.showSuccess('Nouveau point de vente créé et rattaché.');
		} catch (err) {
			const message = err.message || 'Impossible de créer ce point de vente.';
			setError(message);
			toast.showError(message);
		} finally {
			setCreating(false);
		}
	};

	const handleDetach = async (idLieu) => {
		setDetachingId(idLieu);
		setError('');
		setMessage('');
		try {
			await detachMutation.mutateAsync(idLieu);
			setMessage('Point de vente detache.');
			toast.showSuccess('Point de vente detache.');
		} catch (err) {
			const message = err.message || 'Impossible de detacher ce point de vente.';
			setError(message);
			toast.showError(message);
		} finally {
			setDetachingId(null);
		}
	};

	const selectSuggestedSalesPointAddress = (suggestion) => {
		setNewSalesPoint((current) => ({
			...current,
			adresse_ligne: suggestion.adresse_ligne,
			code_postal: suggestion.code_postal,
			ville: suggestion.ville
		}));
	};

	if (!selectedCompany?.id) return null;

	return (
		<section className="col-span-12 rounded-2xl border border-neutral-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f6f2e8_100%)] p-5 shadow-[0_18px_42px_rgba(29,52,34,.08)]">
			<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Points de vente</p>
					<h2 className="mt-1 text-2xl font-bold text-secondary-900">Gerer les lieux de vente</h2>
					<p className="mt-2 text-sm text-secondary-700">
						Entreprise active: <strong>{selectedCompany.nom}</strong>
					</p>
				</div>
			</div>

			{loading ? <p className="mt-4 text-sm text-secondary-600">Chargement des points de vente...</p> : null}
			{error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
			{message ? <p className="mt-4 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700">{message}</p> : null}

			<div className="mt-5 grid gap-5 xl:grid-cols-2">
				<div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
					<h3 className="text-lg font-semibold text-secondary-900">Points de vente rattachés</h3>
					{!loading && data.currentSalesPoints.length === 0 ? (
						<p className="mt-3 text-sm text-secondary-600">Aucun point de vente rattaché à cette entreprise.</p>
					) : (
						<ul className="mt-4 space-y-3">
							{data.currentSalesPoints.map((salesPoint) => (
								<li key={salesPoint.idLieu} className="rounded-xl border border-neutral-200 bg-[#fcfaf5] p-4 shadow-sm">
									<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
										<div className="min-w-0">
											<p className="font-semibold text-secondary-900">{salesPoint.nom}</p>
											<p className="mt-1 text-sm text-secondary-600">{formatAddress(salesPoint)}</p>
											{salesPoint.horaires ? <p className="mt-2 inline-flex rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700">Horaires: {salesPoint.horaires}</p> : null}
											{salesPoint.coordinates ? (
												<p className="mt-2 text-xs text-secondary-500">
													Coordonnées : {salesPoint.coordinates.latitude}, {salesPoint.coordinates.longitude}
												</p>
											) : null}
										</div>
										<button
											type="button"
											className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
											disabled={detachingId === salesPoint.idLieu}
											onClick={() => handleDetach(salesPoint.idLieu)}
										>
											{detachingId === salesPoint.idLieu ? 'Retrait...' : 'Detacher'}
										</button>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="space-y-5">
					<div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
						<h3 className="text-lg font-semibold text-secondary-900">Rattacher un point existant</h3>
						{data.availableSalesPoints.length === 0 ? (
							<p className="mt-3 text-sm text-secondary-600">Aucun autre point de vente disponible.</p>
						) : (
							<div className="mt-4 flex flex-col gap-3">
								<select
									className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-secondary-800"
									value={selectedExistingId}
									onChange={(event) => setSelectedExistingId(event.target.value)}
								>
									{data.availableSalesPoints.map((salesPoint) => (
										<option key={salesPoint.idLieu} value={String(salesPoint.idLieu)}>
											{salesPoint.nom} · {formatAddress(salesPoint)}
										</option>
									))}
								</select>
								<button
									type="button"
									className="h-11 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
									disabled={!selectedExistingId || attaching}
									onClick={handleAttach}
								>
									{attaching ? 'Rattachement...' : 'Rattacher ce point'}
								</button>
							</div>
						)}
					</div>

					<form className="rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm" onSubmit={handleCreate}>
						<h3 className="text-lg font-semibold text-secondary-900">Créer un nouveau point de vente</h3>
						<div className="mt-4 grid gap-3">
							<input
								className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-secondary-800"
								placeholder="Nom du point de vente"
								value={newSalesPoint.nom}
								onChange={(event) => setNewSalesPoint((current) => ({ ...current, nom: event.target.value }))}
							/>
							<input
								className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-secondary-800"
								placeholder="Horaires"
								value={newSalesPoint.horaires}
								onChange={(event) => setNewSalesPoint((current) => ({ ...current, horaires: event.target.value }))}
							/>
							<AddressAutocompleteInput
								className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-secondary-800"
								placeholder="Adresse"
								value={newSalesPoint.adresse_ligne}
								onAddressChange={(nextValue) => setNewSalesPoint((current) => ({ ...current, adresse_ligne: nextValue }))}
								onSuggestionSelect={selectSuggestedSalesPointAddress}
							/>
							<div className="grid gap-3 sm:grid-cols-2">
								<input
									className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-secondary-800"
									placeholder="Code postal"
									value={newSalesPoint.code_postal}
									onChange={(event) => setNewSalesPoint((current) => ({ ...current, code_postal: event.target.value }))}
								/>
								<input
									className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-secondary-800"
									placeholder="Ville"
									value={newSalesPoint.ville}
									onChange={(event) => setNewSalesPoint((current) => ({ ...current, ville: event.target.value }))}
								/>
							</div>
							<button
								type="submit"
								className="h-11 rounded-xl bg-secondary-900 px-4 text-sm font-semibold text-white transition hover:bg-secondary-800 disabled:opacity-50"
								disabled={creating}
							>
								{creating ? 'Création...' : 'Créer et rattacher'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}
