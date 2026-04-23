import { useNavigate } from 'react-router';

const TYPE_ICONS = {
	bienvenue: 'waving_hand',
	commande: 'receipt_long',
	fidelite: 'workspace_premium',
	incident: 'support_agent',
	info: 'notifications',
};

function formatDate(value) {
	if (!value) return '';
	return new Date(value).toLocaleString('fr-FR', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export default function NotificationsMenu({ isAuthenticated, notifications = [], onMarkRead, onMarkAllRead, onDelete, onClose }) {
	const navigate = useNavigate();

	if (!isAuthenticated) {
		return (
			<p className="text-sm leading-6 text-neutral-700">
				Connectez-vous pour retrouver les notifications liées à vos commandes, tickets et offres locales.
			</p>
		);
	}

	const handleClick = async (notif) => {
		if (!notif.lu) await onMarkRead?.(notif.id);
		if (notif.lien) {
			navigate(notif.lien);
			onClose?.();
		}
	};

	const unreadCount = notifications.filter((n) => !n.lu).length;

	if (!notifications.length) {
		return (
			<div className="rounded-2xl bg-neutral-100 p-4">
				<p className="text-sm font-semibold text-secondary-900">Aucune notification.</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{unreadCount > 0 && (
				<div className="flex justify-end">
					<button
						type="button"
						onClick={() => onMarkAllRead?.()}
						className="text-xs font-semibold text-primary-700 hover:text-primary-800"
					>
						Tout marquer comme lu
					</button>
				</div>
			)}
			{notifications.map((notif) => (
				<button
					key={notif.id}
					type="button"
					onClick={() => handleClick(notif)}
					className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
						notif.lu ? 'bg-white hover:bg-neutral-50' : 'bg-primary-50 hover:bg-primary-100'
					}`}
				>
					<span className={`material-symbols-rounded mt-0.5 text-xl shrink-0 ${notif.lu ? 'text-neutral-400' : 'text-primary-700'}`}>
						{TYPE_ICONS[notif.type] || TYPE_ICONS.info}
					</span>
					<div className="min-w-0 flex-1">
						<p className={`text-sm leading-5 ${notif.lu ? 'text-secondary-600' : 'font-semibold text-secondary-900'}`}>
							{notif.message}
						</p>
						<p className="mt-0.5 text-xs text-neutral-400">{formatDate(notif.createdAt)}</p>
					</div>
						{!notif.lu && (
						<span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />
					)}
					<button
						type="button"
						aria-label="Supprimer"
						onClick={(e) => { e.stopPropagation(); onDelete?.(notif.id); }}
						className="ml-1 mt-0.5 shrink-0 rounded-full p-0.5 text-neutral-300 hover:bg-neutral-200 hover:text-neutral-600"
					>
						<span className="material-symbols-rounded text-base leading-none">close</span>
					</button>
				</button>
			))}
		</div>
	);
}
