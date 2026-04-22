import DataTable from '../../components/DataTable.jsx';
import SurfaceCard from '../../components/layout/SurfaceCard.jsx';
import { severityLabel, severityOptions, severityStyles, statusLabel, statusOptions } from './incidentsData';

export default function IncidentTable({
	filteredTickets,
	onOpenTicket,
	onSeverityFilterChange,
	onStatusFilterChange,
	severityFilter,
	statusFilter,
}) {
	const columns = [
		{ key: 'id', header: 'Ticket', render: (ticket) => <span className="font-semibold">#{ticket.id}</span> },
		{ key: 'title', header: 'Titre' },
		{
			key: 'severity',
			header: 'Severite',
			render: (ticket) => (
				<span className={`rounded-full border px-2 py-1 text-xs font-semibold ${severityStyles[ticket.severity]}`}>
					{severityLabel[ticket.severity] || ticket.severity}
				</span>
			)
		},
		{ key: 'status', header: 'Statut', render: (ticket) => statusLabel[ticket.status] || ticket.status },
		{ key: 'moduleConcerne', header: 'Module' },
		{ key: 'responseCount', header: 'Reponses' },
		{
			key: 'action',
			header: 'Action',
			render: (ticket) => (
				<button
					type="button"
					onClick={() => onOpenTicket(ticket.id)}
					className="rounded-xl bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold hover:bg-primary-50"
				>
					Voir
				</button>
			)
		},
	];

	return (
		<SurfaceCard as="section" className="col-span-12 p-4 xl:col-span-8">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<h2 className="text-xl font-semibold">Suivi des incidents</h2>
				<div className="flex gap-2">
					<select
						value={statusFilter}
						onChange={(event) => onStatusFilterChange(event.target.value)}
					className="rounded-xl bg-neutral-100 px-2.5 py-2 text-sm outline-none ring-primary-500/20 focus:ring"
					>
						<option value="all">Tous statuts</option>
						{statusOptions.map((option) => (
							<option key={option.value} value={option.value}>{option.label}</option>
						))}
					</select>
					<select
						value={severityFilter}
						onChange={(event) => onSeverityFilterChange(event.target.value)}
						className="rounded-xl bg-neutral-100 px-2.5 py-2 text-sm outline-none ring-primary-500/20 focus:ring"
					>
						<option value="all">Toutes severites</option>
						{severityOptions.map((option) => (
							<option key={option.value} value={option.value}>{option.label}</option>
						))}
					</select>
				</div>
			</div>

			<DataTable columns={columns} emptyLabel="Aucun ticket a afficher." getRowKey={(ticket) => ticket.id} rows={filteredTickets} />
		</SurfaceCard>
	);
}
