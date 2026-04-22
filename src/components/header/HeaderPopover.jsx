export default function HeaderPopover({ align = 'right', children, className = '', mobile = false, title }) {
	const alignment = align === 'left' ? 'left-0' : 'right-0';
	const position = mobile ? 'relative w-full' : `absolute top-[calc(100%+1.15rem)] ${alignment} w-[min(22rem,calc(100vw-2rem))]`;
	const surfaceClassName = mobile
		? 'bg-transparent p-0'
		: 'rounded-2xl bg-neutral-50/95 p-4 shadow-[0_24px_70px_rgba(29,52,34,.22)] ring-1 ring-neutral-200 backdrop-blur-md';

	return (
		<div className={`${position} z-50 animate-header-popover text-secondary-900 ${surfaceClassName} ${className}`}>
			{title ? <h2 className="mb-3 text-lg font-bold">{title}</h2> : null}
			{children}
		</div>
	);
}
