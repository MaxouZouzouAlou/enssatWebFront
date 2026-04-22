export default function Alert({ type = 'error', children }) {
	const classes = type === 'success'
		? 'border-primary-200 bg-primary-50 text-primary-900'
		: 'border-red-200 bg-red-50 text-red-900';

	return (
		<div className={`rounded-md border px-3 py-2 text-sm ${classes}`} role="alert">
			{children}
		</div>
	);
}
