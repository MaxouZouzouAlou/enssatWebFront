export default function SurfaceCard({
	as: Component = 'article',
	children,
	className = '',
	interactive = false,
	tone = 'light',
	...props
}) {
	const tones = {
		light: 'bg-neutral-50 text-secondary-900',
		muted: 'bg-neutral-100 text-secondary-900',
		primary: 'bg-primary-800 text-white',
		secondary: 'bg-secondary-900 text-white',
		warm: 'bg-primary-50 text-secondary-900',
	};
	const interactiveClass = interactive ? 'transition hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(29,52,34,.14)]' : '';

	return (
		<Component
			{...props}
			className={`rounded-2xl ${tones[tone] || tones.light} p-5 shadow-[0_16px_40px_rgba(29,52,34,.10)] ${interactiveClass} ${className}`}
		>
			{children}
		</Component>
	);
}
