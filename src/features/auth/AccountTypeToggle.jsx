export default function AccountTypeToggle({ accountType, onChange }) {
	return (
		<div className="mb-5 grid grid-cols-2 rounded-md border border-neutral-300 bg-neutral-200 p-1">
			<button
				type="button"
				onClick={() => onChange('particulier')}
				className={`h-10 rounded text-sm font-semibold transition ${
					accountType === 'particulier' ? 'bg-neutral-50 text-secondary-900 shadow-sm' : 'text-neutral-600 hover:text-secondary-900'
				}`}
			>
				Particulier
			</button>
			<button
				type="button"
				onClick={() => onChange('professionnel')}
				className={`h-10 rounded text-sm font-semibold transition ${
					accountType === 'professionnel' ? 'bg-neutral-50 text-secondary-900 shadow-sm' : 'text-neutral-600 hover:text-secondary-900'
				}`}
			>
				Professionnel
			</button>
		</div>
	);
}
