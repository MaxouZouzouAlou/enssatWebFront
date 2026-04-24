import AddressAutocompleteInput from '../address/AddressAutocompleteInput.jsx';

export default function DeliveryAddressForm({
	adresseLivraison,
	onAddressLineChange,
	onPostalCodeChange,
	onCityChange,
	onSuggestionSelect
}) {
	return (
		<div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
			<p className="text-sm font-semibold text-secondary-900">Adresse de livraison</p>
			<div className="mt-4 grid gap-4">
				<label className="block text-sm font-semibold text-secondary-900" htmlFor="delivery-address-line">
					Adresse
					<AddressAutocompleteInput
						id="delivery-address-line"
						value={adresseLivraison.adresse_ligne}
						onAddressChange={onAddressLineChange}
						onSuggestionSelect={onSuggestionSelect}
						className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm font-normal"
						placeholder="12 rue des Tests"
					/>
				</label>
				<div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
					<label className="block text-sm font-semibold text-secondary-900" htmlFor="delivery-postal-code">
						Code postal
						<input
							id="delivery-postal-code"
							type="text"
							value={adresseLivraison.code_postal}
							onChange={onPostalCodeChange}
							className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm font-normal"
							placeholder="22300"
						/>
					</label>
					<label className="block text-sm font-semibold text-secondary-900" htmlFor="delivery-city">
						Ville
						<input
							id="delivery-city"
							type="text"
							value={adresseLivraison.ville}
							onChange={onCityChange}
							className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm font-normal"
							placeholder="Lannion"
						/>
					</label>
				</div>
			</div>
		</div>
	);
}
