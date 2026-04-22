import { PageShell, SectionHeader } from '../../components/layout';
import IncidentAlert from './IncidentAlert.jsx';
import IncidentDetail from './IncidentDetail.jsx';
import IncidentForm from './IncidentForm.jsx';
import IncidentKpis from './IncidentKpis.jsx';
import IncidentTable from './IncidentTable.jsx';
import useIncidentTickets from './useIncidentTickets';

export default function IncidentTickets({ initialTicketId }) {
	const incidents = useIncidentTickets({ initialTicketId });

	return (
		<PageShell contentClassName="grid grid-cols-12 gap-5">
			<header className="col-span-12">
				<SectionHeader eyebrow="Système d alerte" title="Gestion des tickets incidents">
					<p>
					Signalez un dysfonctionnement, consultez l'avancement et retrouvez les reponses du support directement dans l'application.
					</p>
				{incidents.isLoading ? <p className="mt-2 text-sm text-neutral-600">Chargement des incidents...</p> : null}
				{incidents.error ? <p className="mt-2 text-sm font-medium text-red-700">{incidents.error}</p> : null}
				</SectionHeader>
			</header>

				<IncidentAlert alertBanner={incidents.alertBanner} />
				<IncidentKpis kpi={incidents.kpi} />
				<IncidentForm loading={incidents.mutationLoading} onSubmit={incidents.submitTicket} />
				<IncidentTable
					filteredTickets={incidents.filteredTickets}
					onOpenTicket={incidents.openTicket}
					onSeverityFilterChange={incidents.setSeverityFilter}
					onStatusFilterChange={incidents.setStatusFilter}
					severityFilter={incidents.severityFilter}
					statusFilter={incidents.statusFilter}
				/>
				<IncidentDetail
					detail={incidents.selectedTicket}
					loading={incidents.detailLoading}
					mutationLoading={incidents.mutationLoading}
					onReply={incidents.submitReply}
					onStatusChange={incidents.changeStatus}
					permissions={incidents.permissions}
				/>
		</PageShell>
	);
}
