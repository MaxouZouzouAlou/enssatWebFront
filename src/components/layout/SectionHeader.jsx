export default function SectionHeader({
	actions,
	align = 'left',
	children,
	className = '',
	eyebrow,
	title,
}) {
	const isCenter = align === 'center';

	return (
		<div className={`${isCenter ? 'mx-auto max-w-3xl text-center' : 'flex flex-col gap-4 md:flex-row md:items-end md:justify-between'} ${className}`}>
			<div>
				{eyebrow ? (
					<p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-600">{eyebrow}</p>
				) : null}
				{title ? (
					<h2 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">{title}</h2>
				) : null}
				{children ? <div className="mt-4 max-w-3xl leading-8 text-neutral-700">{children}</div> : null}
			</div>
			{actions ? <div className="shrink-0">{actions}</div> : null}
		</div>
	);
}
