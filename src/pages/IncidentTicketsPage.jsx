import { useSearchParams } from 'react-router';
import IncidentTickets from '../features/incidents/IncidentTickets.jsx';

export default function IncidentTicketsPage() {
	const [searchParams] = useSearchParams();
	return <IncidentTickets initialTicketId={searchParams.get('ticket')} />;
}
