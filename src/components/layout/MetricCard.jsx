import SurfaceCard from './SurfaceCard.jsx';

export default function MetricCard({
	label,
	trend,
	trendClassName = 'text-primary-600',
	value,
	valueClassName = '',
}) {
	return (
		<SurfaceCard className="p-5">
			<p className="text-sm text-neutral-600">{label}</p>
			<p className={`mt-2 text-3xl font-bold ${valueClassName}`}>{value}</p>
			{trend ? <p className={`mt-2 text-xs font-semibold ${trendClassName}`}>{trend}</p> : null}
		</SurfaceCard>
	);
}
