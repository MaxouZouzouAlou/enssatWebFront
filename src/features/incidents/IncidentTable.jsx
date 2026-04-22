import { SurfaceCard } from '../../components/layout';
import { severityLabel, severityOptions, severityStyles, statusLabel, statusOptions } from './incidentsData';

export default function IncidentTable({
	filteredTickets,
	onOpenTicket,
	onSeverityFilterChange,
	onStatusFilterChange,
	severityFilter,
	statusFilter,
}) {
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

			<div className="overflow-x-auto">
				<table className="w-full border-collapse">
					<thead>
						<tr>
							{['Ticket', 'Titre', 'Severite', 'Statut', 'Module', 'Reponses', 'Action'].map((head) => (
								<th
									key={head}
									className="border-b border-neutral-300 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600"
								>
									{head}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{filteredTickets.map((ticket) => (
							<tr key={ticket.id}>
								<td className="border-b border-neutral-200 px-2 py-3 text-sm font-semibold">#{ticket.id}</td>
								<td className="border-b border-neutral-200 px-2 py-3 text-sm">{ticket.title}</td>
								<td className="border-b border-neutral-200 px-2 py-3 text-sm">
									<span
										className={`rounded-full border px-2 py-1 text-xs font-semibold ${severityStyles[ticket.severity]}`}
									>
										{severityLabel[ticket.severity] || ticket.severity}
									</span>
								</td>
								<td className="border-b border-neutral-200 px-2 py-3 text-sm">{statusLabel[ticket.status] || ticket.status}</td>
								<td className="border-b border-neutral-200 px-2 py-3 text-sm">{ticket.moduleConcerne}</td>
								<td className="border-b border-neutral-200 px-2 py-3 text-sm">{ticket.responseCount}</td>
								<td className="border-b border-neutral-200 px-2 py-3 text-sm">
									<button
										type="button"
										onClick={() => onOpenTicket(ticket.id)}
										className="rounded-xl bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold hover:bg-primary-50"
									>
										Voir
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{filteredTickets.length === 0 ? (
					<p className="py-8 text-center text-sm text-neutral-600">Aucun ticket a afficher.</p>
				) : null}
			</div>
		</SurfaceCard>
	);
}
