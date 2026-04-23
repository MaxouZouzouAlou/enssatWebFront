import { useNavigate } from 'react-router';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import champAuthImage from '../../assets/images/auth/champ-auth.webp';

export default function AuthShell({ children, leftTitle }) {
	const navigate = useNavigate();

	return (
		<main className="relative min-h-screen overflow-hidden bg-neutral-100 text-secondary-900">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-primary-200/40 blur-3xl"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-secondary-200/30 blur-3xl"
			/>
			<div className="relative grid min-h-screen lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
				<section className="relative hidden overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 px-10 py-12 text-white shadow-[0_22px_60px_rgba(29,52,34,.26)] lg:flex lg:flex-col lg:justify-between">
					<img
						alt="Paysage de champs verdoyants"
						aria-hidden="true"
						className="absolute inset-0 h-full w-full object-cover"
						src={champAuthImage}
					/>
					<div
						aria-hidden="true"
						className="absolute inset-0 bg-gradient-to-br from-primary-900/62 via-primary-700/55 to-primary-500/45"
					/>
					<div
						aria-hidden="true"
						className="absolute -right-20 top-10 h-72 w-72 rounded-full border border-white/20 bg-white/10"
					/>
					<div
						aria-hidden="true"
						className="absolute -bottom-24 -left-12 h-80 w-80 rounded-full border border-white/10 bg-primary-800/30"
					/>
					<div className="relative">
						<div className="flex items-center gap-3">
							<Logo className="h-9 w-auto text-primary-50" />
							<p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-100">LOCAL'ZH</p>
						</div>
						<h1 className="mt-8 max-w-xl font-title text-5xl font-semibold leading-tight text-white">
							{leftTitle || 'Authentification clients et professionnels'}
						</h1>
					</div>
					<div />
				</section>
				<section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
					<div className="w-full max-w-2xl">
						<button
							onClick={() => navigate(-1)}
							className="mb-6 flex items-center gap-1.5 text-sm font-medium text-secondary-600 hover:text-primary-600"
						>
							<span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>arrow_back</span>
							Retour
						</button>
						<div className="relative rounded-3xl border border-neutral-300/70 bg-neutral-50/95 p-3 shadow-[0_20px_60px_rgba(29,52,34,.14)] backdrop-blur-sm sm:p-4">
							{children}
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
