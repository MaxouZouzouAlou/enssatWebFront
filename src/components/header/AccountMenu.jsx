import { useNavigate } from 'react-router';
import { ActionButton } from '../Button.jsx';

const commonAuthenticatedItems = [
	{ icon: 'tune', label: 'Paramètres', path: '/compte' },
	{ icon: 'receipt_long', label: 'Mes commandes', path: '/compte' },
	{ icon: 'person', label: 'Mon compte', path: '/compte' },
	{ icon: 'workspace_premium', label: 'Ma fidélité', path: '/compte' },
];

export default function AccountMenu({ isAuthenticated, isProfessional, onClose, onSignOut }) {
	const navigate = useNavigate();

	const goTo = (path) => {
		navigate(path);
		onClose?.();
	};

	if (!isAuthenticated) {
		return (
			<div className="space-y-3">
				<p className="text-sm leading-6 text-neutral-700">
					Connectez-vous pour accéder à vos commandes, vos favoris et votre suivi de fidélité.
				</p>
				<ActionButton
					type="button"
					onClick={() => goTo('/login')}
					className="w-full"
				>
					Se connecter
				</ActionButton>
				<ActionButton
					type="button"
					onClick={() => goTo('/register')}
					className="w-full"
					variant="secondary"
				>
					Créer un compte
				</ActionButton>
			</div>
		);
	}

	const items = isProfessional
		? [...commonAuthenticatedItems, { icon: 'monitoring', label: 'Dashboard vendeur', path: '/dashboard-producteur' }]
		: commonAuthenticatedItems;

	return (
		<div className="space-y-2">
			{items.map((item) => (
				<button
					key={item.label}
					type="button"
					onClick={() => goTo(item.path)}
					className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-secondary-800 hover:bg-primary-50 hover:text-primary-700"
				>
					<span className="material-symbols-rounded text-xl text-primary-700">{item.icon}</span>
					{item.label}
				</button>
			))}
			<div className="pt-2">
				<button
					type="button"
					onClick={() => {
						onClose?.();
						onSignOut?.();
					}}
					className="flex w-full items-center gap-3 rounded-xl bg-neutral-100 px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
				>
					<span className="material-symbols-rounded text-xl">logout</span>
					Me déconnecter
				</button>
			</div>
		</div>
	);
}
