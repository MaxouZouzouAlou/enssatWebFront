import { API_BASE_URL } from './auth-client.js';

export async function fetchMapLocations() {
  const response = await fetch(`${API_BASE_URL}/map/lieux`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les lieux de vente.');
  }

  return response.json();
}

export async function fetchOffersByLocation(idLieu) {
  const response = await fetch(`${API_BASE_URL}/map/lieux/${idLieu}/offres`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les offres de ce lieu.');
  }

  return response.json();
}
