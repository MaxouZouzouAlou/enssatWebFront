export function Field({ label, error, children }) {
	return (
		<label className="block">
			<span className="mb-2 block text-sm font-medium text-zinc-800">{label}</span>
			{children}
			{error ? <span className="mt-1 block text-sm text-red-700">{error}</span> : null}
		</label>
	);
}

export function TextInput(props) {
	return (
		<input
			{...props}
			className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-zinc-100"
		/>
	);
}

export function PrimaryButton({ children, loading, ...props }) {
	return (
		<button
			{...props}
			disabled={loading || props.disabled}
			className="inline-flex h-11 w-full items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
		>
			{loading ? 'Chargement...' : children}
		</button>
	);
}

export function SecondaryButton({ children, ...props }) {
	return (
		<button
			{...props}
			className="inline-flex h-11 w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-100"
		>
			{children}
		</button>
	);
}

export function Alert({ type = 'error', children }) {
	const classes = type === 'success'
		? 'border-emerald-200 bg-emerald-50 text-emerald-900'
		: 'border-red-200 bg-red-50 text-red-900';

	return (
		<div className={`rounded-md border px-3 py-2 text-sm ${classes}`} role="alert">
			{children}
		</div>
	);
}
