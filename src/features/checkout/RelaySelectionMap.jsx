import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
});

function formatAddress(address) {
	if (!address) return '';
	return [address.ligne, address.codePostal, address.ville].filter(Boolean).join(', ');
}

function MapViewportController({ center, zoom }) {
	const map = useMap();

	useEffect(() => {
		if (!Array.isArray(center) || center.length !== 2) return;
		map.setView(center, zoom);
	}, [center, map, zoom]);

	return null;
}

export default function RelaySelectionMap({ relay }) {
	const latitude = Number(relay?.coordinates?.latitude);
	const longitude = Number(relay?.coordinates?.longitude);

	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

	return (
		<div className="overflow-hidden rounded-2xl border border-neutral-200">
			<div className="h-[260px] w-full">
				<MapContainer
					center={[latitude, longitude]}
					zoom={14}
					scrollWheelZoom
					className="h-full w-full"
				>
					<MapViewportController center={[latitude, longitude]} zoom={14} />
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<Marker position={[latitude, longitude]}>
						<Popup>
							<p className="font-semibold">{relay.nom}</p>
							<p className="text-sm">{formatAddress(relay.adresse)}</p>
						</Popup>
					</Marker>
				</MapContainer>
			</div>
		</div>
	);
}
