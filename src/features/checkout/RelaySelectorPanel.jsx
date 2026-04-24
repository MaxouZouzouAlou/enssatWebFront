import RelaySelectionMap from './RelaySelectionMap.jsx';

export default function RelaySelectorPanel({
	relayId,
	onChange,
	relayOptions = [],
	selectedRelay,
	formatAddress
}) {
	return (
		<div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
			<label className="block text-sm font-semibold text-secondary-900" htmlFor="relay-id">
				Point relais
				<select
					id="relay-id"
					value={relayId}
					onChange={(event) => onChange(event.target.value)}
					className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
				>
					<option value="">Choisir un point relais</option>
					{relayOptions.map((relay) => (
						<option key={relay.idRelais} value={relay.idRelais}>
							{relay.nom} · {relay.adresse.ligne}, {relay.adresse.codePostal} {relay.adresse.ville}
						</option>
					))}
				</select>
			</label>
			{!relayId ? (
				<p className="mt-3 text-sm text-secondary-600">
					Sélectionnez un point relais pour afficher son emplacement et calculer le récapitulatif.
				</p>
			) : null}
			{selectedRelay ? (
				<div className="mt-4 space-y-4">
					<div className="rounded-2xl border border-neutral-200 bg-white p-4">
						<p className="font-semibold text-secondary-900">{selectedRelay.nom}</p>
						<p className="mt-1 text-sm text-secondary-600">{formatAddress(selectedRelay.adresse)}</p>
					</div>
					<RelaySelectionMap relay={selectedRelay} />
				</div>
			) : null}
		</div>
	);
}
