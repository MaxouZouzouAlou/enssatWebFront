import { Link } from 'react-router';
import SurfaceCard from '../../components/layout/SurfaceCard.jsx';

const steps = [
	{ key: 'livraison', label: 'Livraison', path: '/commande/livraison' },
	{ key: 'paiement', label: 'Paiement', path: '/commande/paiement' },
	{ key: 'verification', label: 'Verification', path: '/commande/verification' }
];

export default function CheckoutStepShell({
	activeStep,
	title,
	description,
	children,
	aside
}) {
	return (
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
			<div className="space-y-5">
				<SurfaceCard className="p-5 sm:p-6">
					<div className="flex flex-wrap gap-3">
						{steps.map((step, index) => {
							const active = step.key === activeStep;
							const enabled = steps.findIndex((item) => item.key === activeStep) >= index;

							return enabled ? (
								<Link
									key={step.key}
									to={step.path}
									className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
										active ? 'bg-primary-700 text-white' : 'bg-neutral-100 text-secondary-800 hover:bg-neutral-200'
									}`}
								>
									<span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${active ? 'bg-white/20' : 'bg-white'}`}>
										{index + 1}
									</span>
									{step.label}
								</Link>
							) : (
								<span
									key={step.key}
									className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-400"
								>
									<span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs">
										{index + 1}
									</span>
									{step.label}
								</span>
							);
						})}
					</div>
					<h2 className="mt-5 text-2xl font-semibold text-secondary-900">{title}</h2>
					<p className="mt-2 text-sm text-secondary-600">{description}</p>
				</SurfaceCard>
				{children}
			</div>

			<div className="space-y-5">
				{aside}
			</div>
		</div>
	);
}
