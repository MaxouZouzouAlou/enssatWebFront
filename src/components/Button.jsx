export function PrimaryButton({ children, className = '', loading, ...props }) {
	return (
		<button
			{...props}
			disabled={loading || props.disabled}
			className={`inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 px-4 text-sm font-semibold text-white shadow-md transition hover:scale-[1.015] disabled:cursor-not-allowed disabled:from-neutral-400 disabled:to-neutral-400 disabled:shadow-none disabled:scale-100 ${className}`}
		>
			{loading ? 'Chargement...' : children}
		</button>
	);
}

export function SecondaryButton({ children, ...props }) {
	return (
		<button
			{...props}
			className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-100 px-4 text-sm font-semibold text-secondary-800 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-200"
		>
			{children}
		</button>
	);
}
