import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
});

function formatAddress(stop) {
	if (!stop?.adresse) return '';
	return [stop.adresse.ligne, stop.adresse.codePostal, stop.adresse.ville].filter(Boolean).join(', ');
}

function MapViewportController({ center, zoom }) {
	const map = useMap();

	useEffect(() => {
		if (!Array.isArray(center) || center.length !== 2) return;
		map.setView(center, zoom);
	}, [center, map, zoom]);

	return null;
}

export default function PickupRouteMap({ stops = [], className = '' }) {
	const positions = useMemo(
		() => stops
			.map((stop) => {
				const latitude = Number(stop?.coordinates?.latitude);
				const longitude = Number(stop?.coordinates?.longitude);
				return Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : null;
			})
			.filter(Boolean),
		[stops]
	);

	const center = useMemo(() => {
		if (!positions.length) return [48.7319, -3.4579];
		const latitude = positions.reduce((sum, [lat]) => sum + lat, 0) / positions.length;
		const longitude = positions.reduce((sum, [, lng]) => sum + lng, 0) / positions.length;
		return [latitude, longitude];
	}, [positions]);

	if (!positions.length) return null;

	return (
		<div className={`overflow-hidden rounded-2xl border border-neutral-200 ${className}`}>
			<div className="h-[280px] w-full">
				<MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
					<MapViewportController center={center} zoom={12} />
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<Polyline positions={positions} pathOptions={{ color: '#2f6b43', weight: 4, opacity: 0.8 }} />
					{stops.map((stop, index) => {
						const latitude = Number(stop?.coordinates?.latitude);
						const longitude = Number(stop?.coordinates?.longitude);
						if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

						return (
							<Marker key={`${stop.idLieu}-${index}`} position={[latitude, longitude]}>
								<Popup>
									<p className="font-semibold">{stop.stopNumber}. {stop.nom}</p>
									<p className="text-sm">{formatAddress(stop)}</p>
									{index > 0 ? <p className="text-sm">Trajet précédent: {Number(stop.legDistanceKm || 0).toFixed(2)} km</p> : null}
								</Popup>
							</Marker>
						);
					})}
				</MapContainer>
			</div>
		</div>
	);
}
