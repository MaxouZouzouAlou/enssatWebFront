export default function AuthShell({ children, sideContent }) {
	return (
		<main className="min-h-screen bg-zinc-50 text-zinc-950">
			<div className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
				<section className="hidden border-r border-zinc-200 bg-white px-10 py-12 lg:flex lg:flex-col lg:justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">LOCAL'ZH</p>
						<h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight text-zinc-950">
							Authentification clients et professionnels
						</h1>
					</div>
					<div className="max-w-xl">{sideContent}</div>
				</section>
				<section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
					<div className="w-full max-w-2xl">{children}</div>
				</section>
			</div>
		</main>
	);
}
