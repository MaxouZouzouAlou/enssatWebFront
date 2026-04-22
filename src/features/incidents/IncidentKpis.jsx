import { MetricCard } from '../../components/layout';

export default function IncidentKpis({ kpi }) {
	return (
		<section className="col-span-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<MetricCard label="Tickets ouverts" value={kpi.open} />
			<MetricCard label="En cours" value={kpi.inProgress} />
			<MetricCard label="Critiques actives" value={kpi.critical} valueClassName="text-red-700" />
			<MetricCard label="Resolus / clotures" value={kpi.resolved} valueClassName="text-primary-600" />
		</section>
	);
}
