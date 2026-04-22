export default function AccountTypeToggle({ accountType, onChange }) {
	return (
		<div className="mb-6 grid grid-cols-2 rounded-xl border border-neutral-300 bg-neutral-100 p-1.5">
			<button
				type="button"
				onClick={() => onChange('particulier')}
				className={`h-10 rounded-lg text-sm font-semibold transition ${
					accountType === 'particulier' ? 'bg-primary-500 text-white shadow-sm' : 'text-secondary-600 hover:bg-neutral-200 hover:text-secondary-900'
				}`}
			>
				Particulier
			</button>
			<button
				type="button"
				onClick={() => onChange('professionnel')}
				className={`h-10 rounded-lg text-sm font-semibold transition ${
					accountType === 'professionnel' ? 'bg-primary-500 text-white shadow-sm' : 'text-secondary-600 hover:bg-neutral-200 hover:text-secondary-900'
				}`}
			>
				Professionnel
			</button>
		</div>
	);
}
