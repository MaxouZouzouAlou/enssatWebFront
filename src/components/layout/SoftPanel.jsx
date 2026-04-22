export default function SoftPanel({ as: Component = 'div', children, className = '', ...props }) {
	return (
		<Component {...props} className={`rounded-2xl bg-neutral-100 p-4 ${className}`}>
			{children}
		</Component>
	);
}
