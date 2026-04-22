export default function PageShell({
	as: Component = 'main',
	children,
	className = '',
	contentClassName = '',
	fullWidth = false,
	hero = false,
}) {
	const spacing = hero ? 'py-14 md:py-20' : 'py-10 md:py-14';
	const width = fullWidth ? 'w-full' : 'mx-auto w-[min(1180px,calc(100%-2rem))]';

	return (
		<Component className={`min-h-[calc(100vh-5.5rem)] bg-neutral-100 text-secondary-900 ${className}`}>
			<div className={`${width} ${spacing} ${contentClassName}`}>
				{children}
			</div>
		</Component>
	);
}
