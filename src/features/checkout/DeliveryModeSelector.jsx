export default function DeliveryModeSelector({ options = [], modeLivraison, onChange, formatAddress }) {
	return (
		<div className="grid gap-3">
			{options.map((option) => (
				<label
					key={option.value}
					className={`rounded-2xl border px-4 py-4 transition ${
						modeLivraison === option.value ? 'border-primary-300 bg-[#fcfaf5]' : 'border-neutral-200 bg-white'
					}`}
				>
					<div className="flex items-start gap-3">
						<input
							type="radio"
							name="modeLivraison"
							value={option.value}
							checked={modeLivraison === option.value}
							onChange={(event) => onChange(event.target.value)}
							disabled={!option.available}
							className="mt-1 accent-primary-700"
						/>
						<div>
							<p className="font-semibold text-secondary-900">{option.label}</p>
							<p className="mt-1 text-sm text-secondary-600">
								{Number(option.frais || 0).toFixed(2)} € de frais
							</p>
							{option.value === 'domicile' && option.address ? (
								<p className="mt-1 text-xs text-secondary-500">Adresse préremplie : {formatAddress(option.address)}</p>
							) : null}
							{!option.available ? (
								<p className="mt-1 text-xs font-semibold text-red-700">
									Option indisponible pour le moment.
								</p>
							) : null}
						</div>
					</div>
				</label>
			))}
		</div>
	);
}
