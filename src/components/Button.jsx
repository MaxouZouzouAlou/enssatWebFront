import { Link } from 'react-router';

const baseClasses = 'inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed';

const variantClasses = {
	primary: 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md hover:scale-[1.015] disabled:from-neutral-400 disabled:to-neutral-400 disabled:shadow-none disabled:scale-100',
	secondary: 'bg-neutral-100 text-secondary-800 hover:bg-neutral-200 disabled:bg-neutral-200',
	light: 'bg-neutral-50 text-secondary-800 shadow-sm hover:bg-neutral-200 disabled:bg-neutral-200',
	danger: 'bg-red-300 text-red-700 hover:bg-red-600 hover:text-white disabled:bg-neutral-200',
	outline: 'border border-primary-100/40 text-white hover:bg-white/10 disabled:opacity-50',
};

export function ActionButton({ children, className = '', loading, variant = 'primary', ...props }) {
	return (
		<button
			{...props}
			disabled={loading || props.disabled}
			className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`}
		>
			{loading ? 'Chargement...' : children}
		</button>
	);
}

export function ActionLink({ children, className = '', to, variant = 'primary', ...props }) {
	return (
		<Link
			{...props}
			className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`}
			to={to}
		>
			{children}
		</Link>
	);
}

export function PrimaryButton({ children, className = '', loading, ...props }) {
	return <ActionButton {...props} className={className} loading={loading} variant="primary">{children}</ActionButton>;
}

export function SecondaryButton({ children, ...props }) {
	return <ActionButton {...props} className="w-full" variant="secondary">{children}</ActionButton>;
}
