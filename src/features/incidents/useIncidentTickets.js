import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	createIncident,
	fetchIncident,
	fetchIncidents,
	replyToIncident,
	updateIncidentStatus,
} from '../../services/incidents-client';

const emptyPermissions = {
	canManageTickets: false,
	canReply: false,
	canChangeStatus: false,
};

export default function useIncidentTickets({ initialTicketId } = {}) {
	const [tickets, setTickets] = useState([]);
	const [permissions, setPermissions] = useState(emptyPermissions);
	const [selectedTicket, setSelectedTicket] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [detailLoading, setDetailLoading] = useState(false);
	const [mutationLoading, setMutationLoading] = useState(false);
	const [error, setError] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [severityFilter, setSeverityFilter] = useState('all');

	const loadTickets = useCallback(async ({ silent = false } = {}) => {
		if (!silent) setIsLoading(true);
		try {
			const payload = await fetchIncidents();
			setTickets(Array.isArray(payload.tickets) ? payload.tickets : []);
			setPermissions(payload.permissions || emptyPermissions);
			setError('');
		} catch (err) {
			setError(err.message);
		} finally {
			if (!silent) setIsLoading(false);
		}
	}, []);

	const openTicket = useCallback(async (ticketId) => {
		if (!ticketId) return;
		setDetailLoading(true);
		try {
			const detail = await fetchIncident(ticketId);
			setSelectedTicket(detail);
			setPermissions(detail.permissions || emptyPermissions);
			setError('');
		} catch (err) {
			setError(err.message);
		} finally {
			setDetailLoading(false);
		}
	}, []);

	useEffect(() => {
		loadTickets();
	}, [loadTickets]);

	useEffect(() => {
		if (initialTicketId) {
			openTicket(initialTicketId);
		}
	}, [initialTicketId, openTicket]);

	const filteredTickets = useMemo(() => {
		return tickets.filter((ticket) => {
			const statusOk = statusFilter === 'all' || ticket.status === statusFilter;
			const severityOk = severityFilter === 'all' || ticket.severity === severityFilter;
			return statusOk && severityOk;
		});
	}, [tickets, statusFilter, severityFilter]);

	const kpi = useMemo(() => {
		const open = tickets.filter((ticket) => ticket.status === 'open').length;
		const inProgress = tickets.filter((ticket) => ticket.status === 'in_progress').length;
		const critical = tickets.filter((ticket) => ticket.severity === 'critical' && !['resolved', 'closed'].includes(ticket.status)).length;
		const resolved = tickets.filter((ticket) => ticket.status === 'resolved' || ticket.status === 'closed').length;
		return { open, inProgress, critical, resolved };
	}, [tickets]);

	const alertBanner = useMemo(() => {
		if (kpi.critical > 0) {
			return {
				level: 'critical',
				title: 'Alerte critique active',
				message: `${kpi.critical} incident(s) critique(s) necessitent une action immediate.`,
			};
		}

		if (kpi.open + kpi.inProgress > 0) {
			return {
				level: 'warning',
				title: 'Surveillance en cours',
				message: `${kpi.open + kpi.inProgress} incident(s) ouverts ou en traitement.`,
			};
		}

		return {
			level: 'ok',
			title: 'Service stable',
			message: 'Aucun incident actif detecte actuellement.',
		};
	}, [kpi]);

	const submitTicket = async (payload) => {
		setMutationLoading(true);
		try {
			const detail = await createIncident(payload);
			setSelectedTicket(detail);
			await loadTickets({ silent: true });
			setError('');
			return true;
		} catch (err) {
			setError(err.message);
			return false;
		} finally {
			setMutationLoading(false);
		}
	};

	const submitReply = async (message) => {
		if (!selectedTicket?.ticket?.id) return false;
		setMutationLoading(true);
		try {
			const detail = await replyToIncident(selectedTicket.ticket.id, message);
			setSelectedTicket(detail);
			await loadTickets({ silent: true });
			setError('');
			return true;
		} catch (err) {
			setError(err.message);
			return false;
		} finally {
			setMutationLoading(false);
		}
	};

	const changeStatus = async (status, commentaire) => {
		if (!selectedTicket?.ticket?.id) return false;
		setMutationLoading(true);
		try {
			const detail = await updateIncidentStatus(selectedTicket.ticket.id, status, commentaire);
			setSelectedTicket(detail);
			await loadTickets({ silent: true });
			setError('');
			return true;
		} catch (err) {
			setError(err.message);
			return false;
		} finally {
			setMutationLoading(false);
		}
	};

	return {
		alertBanner,
		changeStatus,
		detailLoading,
		error,
		filteredTickets,
		isLoading,
		kpi,
		loadTickets,
		mutationLoading,
		openTicket,
		permissions,
		selectedTicket,
		setSeverityFilter,
		setStatusFilter,
		severityFilter,
		statusFilter,
		submitReply,
		submitTicket,
	};
}
