import { API_BASE_URL } from './auth-client.js';

export async function fetchMapLocations() {
  const response = await fetch(`${API_BASE_URL}/map/lieux`, {
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Impossible de charger les lieux de vente.');
  }

  return data;
}

export async function fetchOffersByLocation(idLieu) {
  const response = await fetch(`${API_BASE_URL}/map/lieux/${idLieu}/offres`, {
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Impossible de charger les offres de ce lieu.');
  }

  return data;
}
