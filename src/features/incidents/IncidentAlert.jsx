import { SurfaceCard } from '../../components/layout';
import { alertLevelClasses } from './incidentsData';

export default function IncidentAlert({ alertBanner }) {
	return (
		<SurfaceCard as="section" className={`col-span-12 border p-4 ${alertLevelClasses[alertBanner.level] || alertLevelClasses.ok}`}>
			<h2 className="text-lg font-semibold">{alertBanner.title}</h2>
			<p className="mt-1 text-sm">{alertBanner.message}</p>
		</SurfaceCard>
	);
}
