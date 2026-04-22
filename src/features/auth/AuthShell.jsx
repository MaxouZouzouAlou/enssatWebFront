import { useNavigate } from 'react-router';

export default function AuthShell({ children, sideContent }) {
	const navigate = useNavigate();

	return (
		<main className="min-h-screen bg-neutral-100 text-secondary-900">
			<div className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
				<section className="hidden bg-neutral-50 px-10 py-12 shadow-[0_16px_40px_rgba(29,52,34,.10)] lg:flex lg:flex-col lg:justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">LOCAL'ZH</p>
						<h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight text-secondary-900">
							Authentification clients et professionnels
						</h1>
					</div>
					<div className="max-w-xl">{sideContent}</div>
				</section>
				<section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
					<div className="w-full max-w-2xl">
						<button
							onClick={() => navigate(-1)}
							className="mb-6 flex items-center gap-1.5 text-sm font-medium text-secondary-500 hover:text-primary-600"
						>
							<span className="material-symbols-rounded" style={{ fontSize: '1.1rem' }}>arrow_back</span>
							Retour
						</button>
						{children}
					</div>
				</section>
			</div>
		</main>
	);
}
