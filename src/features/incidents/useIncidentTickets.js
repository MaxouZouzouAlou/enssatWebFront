import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createIncident,
	fetchIncident,
	fetchIncidents,
	replyToIncident,
	updateIncidentStatus,
} from '../../services/incidents-client';
import { queryKeys } from '../../utils/queryKeys.js';

const emptyPermissions = {
	canManageTickets: false,
	canReply: false,
	canChangeStatus: false,
};

export default function useIncidentTickets({ initialTicketId } = {}) {
	const queryClient = useQueryClient();
	const [selectedTicketId, setSelectedTicketId] = useState(initialTicketId || null);
	const [error, setError] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [severityFilter, setSeverityFilter] = useState('all');

	const incidentsQuery = useQuery({
		queryKey: queryKeys.incidents.list,
		queryFn: fetchIncidents,
	});
	const incidentDetailQuery = useQuery({
		queryKey: queryKeys.incidents.detail(selectedTicketId),
		queryFn: () => fetchIncident(selectedTicketId),
		enabled: Boolean(selectedTicketId),
	});

	useEffect(() => {
		if (initialTicketId) {
			setSelectedTicketId(initialTicketId);
		}
	}, [initialTicketId]);

	useEffect(() => {
		const nextError = incidentsQuery.error?.message || incidentDetailQuery.error?.message || '';
		setError(nextError);
	}, [incidentsQuery.error, incidentDetailQuery.error]);

	const loadTickets = async () => {
		await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.list });
	};

	const openTicket = async (ticketId) => {
		if (!ticketId) return;
		setSelectedTicketId(ticketId);
	};

	const refreshIncidentData = async (ticketId) => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: queryKeys.incidents.list }),
			queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(ticketId) }),
		]);
	};

	const createIncidentMutation = useMutation({
		mutationFn: createIncident,
		onSuccess: async (detail) => {
			setSelectedTicketId(detail?.ticket?.id || null);
			await Promise.all([
				queryClient.setQueryData(queryKeys.incidents.detail(detail?.ticket?.id), detail),
				queryClient.invalidateQueries({ queryKey: queryKeys.incidents.list }),
			]);
		},
	});

	const replyMutation = useMutation({
		mutationFn: ({ ticketId, message }) => replyToIncident(ticketId, message),
		onSuccess: async (detail) => {
			const ticketId = detail?.ticket?.id;
			if (ticketId) {
				queryClient.setQueryData(queryKeys.incidents.detail(ticketId), detail);
				await refreshIncidentData(ticketId);
			}
		},
	});

	const changeStatusMutation = useMutation({
		mutationFn: ({ ticketId, status, commentaire }) => updateIncidentStatus(ticketId, status, commentaire),
		onSuccess: async (detail) => {
			const ticketId = detail?.ticket?.id;
			if (ticketId) {
				queryClient.setQueryData(queryKeys.incidents.detail(ticketId), detail);
				await refreshIncidentData(ticketId);
			}
		},
	});

	const tickets = useMemo(
		() => (Array.isArray(incidentsQuery.data?.tickets) ? incidentsQuery.data.tickets : []),
		[incidentsQuery.data?.tickets]
	);
	const permissions = incidentDetailQuery.data?.permissions || incidentsQuery.data?.permissions || emptyPermissions;
	const selectedTicket = incidentDetailQuery.data || null;
	const isLoading = incidentsQuery.isLoading;
	const detailLoading = incidentDetailQuery.isLoading || incidentDetailQuery.isFetching;
	const mutationLoading = createIncidentMutation.isPending || replyMutation.isPending || changeStatusMutation.isPending;

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
		try {
			const detail = await createIncidentMutation.mutateAsync(payload);
			setError('');
			if (detail?.ticket?.id) {
				setSelectedTicketId(detail.ticket.id);
			}
			return true;
		} catch (err) {
			setError(err.message);
			return false;
		}
	};

	const submitReply = async (message) => {
		if (!selectedTicket?.ticket?.id) return false;
		try {
			await replyMutation.mutateAsync({ ticketId: selectedTicket.ticket.id, message });
			setError('');
			return true;
		} catch (err) {
			setError(err.message);
			return false;
		}
	};

	const changeStatus = async (status, commentaire) => {
		if (!selectedTicket?.ticket?.id) return false;
		try {
			await changeStatusMutation.mutateAsync({ ticketId: selectedTicket.ticket.id, status, commentaire });
			setError('');
			return true;
		} catch (err) {
			setError(err.message);
			return false;
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
