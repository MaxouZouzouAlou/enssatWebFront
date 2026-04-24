import { requestJson } from './http-client.js';

export async function fetchMapLocations() {
  return requestJson('/map/lieux', {
    defaultMessage: 'Impossible de charger les lieux de vente.'
  });
}

export async function fetchOffersByLocation(idLieu) {
  return requestJson(`/map/lieux/${idLieu}/offres`, {
    defaultMessage: 'Impossible de charger les offres de ce lieu.'
  });
}
