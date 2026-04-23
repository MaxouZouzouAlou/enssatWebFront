import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteNotification, fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notifications-client.js';
import { queryKeys } from '../utils/queryKeys.js';

const POLL_INTERVAL = 30_000;

export default function useNotifications(isAuthenticated) {
	const queryClient = useQueryClient();

	const notificationsQuery = useQuery({
		queryKey: queryKeys.notifications.list,
		queryFn: fetchNotifications,
		enabled: Boolean(isAuthenticated),
		refetchInterval: isAuthenticated ? POLL_INTERVAL : false,
		refetchIntervalInBackground: true,
		retry: false,
	});

	const notifications = isAuthenticated
		? (notificationsQuery.data?.notifications || [])
		: [];

	const setNotificationsCache = useCallback((updater) => {
		queryClient.setQueryData(queryKeys.notifications.list, (current) => {
			const currentNotifications = current?.notifications || [];
			return {
				...(current || {}),
				notifications: updater(currentNotifications)
			};
		});
	}, [queryClient]);

	const markReadMutation = useMutation({
		mutationFn: markNotificationRead,
	});

	const markAllReadMutation = useMutation({
		mutationFn: markAllNotificationsRead,
	});

	const deleteMutation = useMutation({
		mutationFn: deleteNotification,
	});

	const markRead = useCallback(async (id) => {
		await markReadMutation.mutateAsync(id);
		setNotificationsCache((prev) =>
			prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
		);
	}, [markReadMutation, setNotificationsCache]);

	const markAllRead = useCallback(async () => {
		await markAllReadMutation.mutateAsync();
		setNotificationsCache((prev) => prev.map((n) => ({ ...n, lu: true })));
	}, [markAllReadMutation, setNotificationsCache]);

	const deleteNotif = useCallback(async (id) => {
		await deleteMutation.mutateAsync(id);
		setNotificationsCache((prev) => prev.filter((n) => n.id !== id));
	}, [deleteMutation, setNotificationsCache]);

	const unreadCount = notifications.filter((n) => !n.lu).length;

	return { notifications, unreadCount, markRead, markAllRead, deleteNotif };
}
