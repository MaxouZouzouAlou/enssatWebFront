import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { fetchMapLocations, fetchOffersByLocation } from '../services/map-client.js';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function formatAddress(lieu) {
  if (!lieu?.adresse) return '';
  const { ligne, codePostal, ville } = lieu.adresse;
  return [ligne, codePostal, ville].filter(Boolean).join(', ');
}

function formatPrice(price) {
  return `${Number(price || 0).toFixed(2)} EUR`;
}

function unitLabel(offer) {
  return offer.unitaireOuKilo ? 'unite' : 'kilo';
}

function getLocationCoordinates(location) {
  const rawLatitude = location?.coordinates?.latitude;
  const rawLongitude = location?.coordinates?.longitude;

  if (rawLatitude == null || rawLongitude == null || rawLatitude === '' || rawLongitude === '') {
    return null;
  }

  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return [latitude, longitude];
}

function MapViewportController({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(center) || center.length !== 2) return;
    map.setView(center);
  }, [center, map]);

  return null;
}

export default function InteractiveMapPage() {
  const [locations, setLocations] = useState([]);
  const [selectedLieuId, setSelectedLieuId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoadingLocations(true);
      try {
        const data = await fetchMapLocations();
        const validLocations = Array.isArray(data)
          ? data.filter((location) => getLocationCoordinates(location))
          : [];

        setLocations(validLocations);
        if (validLocations.length > 0) {
          setSelectedLieuId(validLocations[0].idLieu);
        } else {
          setSelectedLieuId(null);
        }
        setError('');
      } catch (err) {
        setError(err.message || 'Erreur de chargement de la carte.');
        setLocations([]);
        setSelectedLieuId(null);
      } finally {
        setLoadingLocations(false);
      }
    };

    run();
  }, []);

  useEffect(() => {
    if (!selectedLieuId) return;

    setSelectedData(null);

    const run = async () => {
      setLoadingOffers(true);
      try {
        const data = await fetchOffersByLocation(selectedLieuId);
        setSelectedData(data);
        setError('');
      } catch (err) {
        setSelectedData(null);
        setError(err.message || 'Erreur de chargement des offres.');
      } finally {
        setLoadingOffers(false);
      }
    };

    run();
  }, [selectedLieuId]);

  const center = useMemo(() => {
    if (!locations.length) return [48.1173, -1.6778];
    const lat = locations.reduce((sum, loc) => sum + Number(loc.coordinates?.latitude || 0), 0) / locations.length;
    const lng = locations.reduce((sum, loc) => sum + Number(loc.coordinates?.longitude || 0), 0) / locations.length;
    return [lat, lng];
  }, [locations]);

  const offers = useMemo(() => {
    if (!Array.isArray(selectedData?.offres)) return [];
    return selectedData.offres.map((offer, index) => ({
      ...offer,
      _key: offer.idProduit != null && offer.idProfessionnel != null
        ? `${offer.idProduit}-${offer.idProfessionnel}`
        : `${offer.nom ?? 'offer'}-${index}`,
    }));
  }, [selectedData]);

  const selectedLieu = selectedData?.lieu;
  const selectedLocation = useMemo(
    () => locations.find((location) => String(location.idLieu) === String(selectedLieuId)) || null,
    [locations, selectedLieuId]
  );

  return (
    <main className="mx-auto w-[min(1240px,calc(100%-2rem))] py-8">
      <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_16px_40px_rgba(29,52,34,.12)] md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Parcours local</p>
        <h1 className="mt-2 text-3xl font-bold text-secondary-900 md:text-4xl">Carte interactive des lieux de vente</h1>
        <p className="mt-3 max-w-3xl text-secondary-600">
          Clique sur un marqueur pour voir les offres disponibles sur le lieu, le producteur et les infos de stock.
        </p>
      </section>

      {error && (
        <section className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </section>
      )}

      <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <article className="xl:col-span-7 rounded-2xl border border-neutral-200 bg-neutral-50 shadow-[0_16px_35px_rgba(29,52,34,.1)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <h2 className="text-lg font-semibold text-secondary-900">Lieux de vente</h2>
            <span className="text-sm text-secondary-500">{locations.length} lieu(x)</span>
          </div>

          <div className="h-[520px] w-full">
            <MapContainer center={center} zoom={11} scrollWheelZoom className="h-full w-full">
              <MapViewportController center={center} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {locations.map((location) => {
                const coordinates = getLocationCoordinates(location);
                if (!coordinates) return null;

                return (
                  <Marker
                    key={location.idLieu}
                    position={coordinates}
                    eventHandlers={{
                      click: () => setSelectedLieuId(location.idLieu),
                    }}
                  >
                    <Popup>
                      <p className="font-semibold">{location.typeLieu || 'Lieu de vente'}</p>
                      <p className="text-sm">{formatAddress(location)}</p>
                      {location.horaires && <p className="text-sm">Horaires: {location.horaires}</p>}
                      <p className="text-sm">{Number(location.offresCount || 0)} offre(s)</p>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </article>

        <article className="xl:col-span-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-[0_16px_35px_rgba(29,52,34,.1)]">
          <h2 className="text-lg font-semibold text-secondary-900">Offres du lieu selectionne</h2>

          {loadingLocations && <p className="mt-3 text-sm text-secondary-600">Chargement des lieux...</p>}

          {!loadingLocations && !locations.length && !error && (
            <p className="mt-3 text-sm text-secondary-600">Aucun lieu de vente exploitable pour le moment.</p>
          )}

          {selectedLieu && (
            <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
              <p className="font-semibold text-secondary-900">{selectedLieu.typeLieu || 'Lieu de vente'}</p>
              <p className="mt-1 text-sm text-secondary-600">{formatAddress(selectedLieu)}</p>
              {selectedLieu.horaires && <p className="mt-1 text-xs text-secondary-500">Horaires: {selectedLieu.horaires}</p>}
            </div>
          )}

          {loadingOffers && <p className="mt-4 text-sm text-secondary-600">Chargement des offres...</p>}

          {!loadingOffers && !selectedLieu && selectedLocation && error && (
            <p className="mt-4 text-sm text-secondary-600">
              Impossible de charger les offres pour {selectedLocation.typeLieu || 'ce lieu'}.
            </p>
          )}

          {!loadingOffers && selectedLieu && offers.length === 0 && (
            <p className="mt-4 text-sm text-secondary-600">Aucune offre visible pour ce lieu pour le moment.</p>
          )}

          <div className="mt-4 space-y-3 max-h-[360px] overflow-auto pr-1">
            {offers.map((offer) => (
              <div key={offer._key} className="rounded-xl border border-neutral-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-secondary-900">{offer.nom}</h3>
                  <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                    {formatPrice(offer.prix)} / {unitLabel(offer)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-secondary-600">
                  {offer.nature} • {offer.bio ? 'Bio' : 'Conventionnel'} • Stock: {offer.stock}
                </p>
                <p className="mt-1 text-sm text-secondary-600">
                  Producteur: {offer.producteur?.prenom} {offer.producteur?.nom}
                </p>
                {offer.entreprise?.nom && (
                  <p className="mt-1 text-sm text-secondary-600">Entreprise: {offer.entreprise.nom}</p>
                )}
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
