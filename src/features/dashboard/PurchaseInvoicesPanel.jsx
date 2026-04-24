import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActionButton } from '../../components/Button.jsx';
import SurfaceCard from '../../components/layout/SurfaceCard.jsx';
import { downloadOrderInvoice, fetchOrderHistory } from '../../services/orders-client/orders-client.js';
import { useToast } from '../../app/ToastProvider.jsx';
import { queryKeys } from '../../utils/queryKeys.js';
import { euro } from '../../utils/formatters.js';

function DashboardPanelHeading({ eyebrow, title, description }) {
	return (
		<div className="mb-4 flex flex-col gap-1">
			{eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-700">{eyebrow}</p> : null}
			<h2 className="text-2xl font-bold text-secondary-900">{title}</h2>
			{description ? <p className="text-sm text-secondary-600">{description}</p> : null}
		</div>
	);
}

export default function PurchaseInvoicesPanel({ professionalId }) {
	const toast = useToast();
	const [message, setMessage] = useState('');

	const purchaseOrdersQuery = useQuery({
		queryKey: queryKeys.orders.history,
		queryFn: fetchOrderHistory,
		enabled: Boolean(professionalId),
	});

	const downloadInvoice = async (idCommande) => {
		setMessage('');
		try {
			await downloadOrderInvoice(idCommande);
			const text = `Facture PDF commande #${idCommande} telechargee.`;
			setMessage(text);
			toast.showSuccess(text);
		} catch (err) {
			const text = err.message || 'Impossible de telecharger cette facture.';
			setMessage(text);
			toast.showError(text);
		}
	};

	const orders = purchaseOrdersQuery.data?.items || [];
	const loading = purchaseOrdersQuery.isLoading;
	const error = purchaseOrdersQuery.error?.message || '';

	return (
		<SurfaceCard className="col-span-12 border border-neutral-200 p-5">
			<DashboardPanelHeading
				eyebrow="Documents"
				title="Factures d'achat du compte"
				description="Toutes les factures des commandes passées avec ce compte professionnel"
			/>
			{message ? (
				<p className="mb-4 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700">
					{message}
				</p>
			) : null}
			{loading ? <p className="text-sm text-secondary-600">Chargement des factures...</p> : null}
			{error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
			{!loading && !error && orders.length === 0 ? (
				<p className="text-sm text-secondary-600">
					Aucune commande d'achat disponible pour générer des factures.
				</p>
			) : (
				<div className="space-y-2">
					{orders.map((order) => (
						<div
							className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-[#fcfaf5] p-4 md:flex-row md:items-center md:justify-between"
							key={order.idCommande}
						>
							<div>
								<p className="font-semibold text-secondary-900">Commande #{order.idCommande}</p>
								<p className="text-sm text-secondary-600">
									{new Date(order.dateCommande).toLocaleDateString('fr-FR')} •{' '}
									{order.modeLivraison || 'non renseigne'} • {order.status}
								</p>
								<p className="mt-1 text-sm font-medium text-secondary-700">
									Total commande: {euro.format(order.prixTotal || 0)}
								</p>
							</div>
							<ActionButton className="h-10" onClick={() => downloadInvoice(order.idCommande)} type="button">
								Telecharger facture
							</ActionButton>
						</div>
					))}
				</div>
			)}
		</SurfaceCard>
	);
}
