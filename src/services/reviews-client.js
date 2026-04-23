import { API_BASE_URL } from './auth-client.js';

async function parseResponse(response, defaultMessage) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || defaultMessage);
  }
  return data;
}

export async function fetchProductReviews(idProduit) {
  const response = await fetch(`${API_BASE_URL}/reviews/products/${idProduit}`, {
    credentials: 'include',
  });
  return parseResponse(response, 'Impossible de charger les avis produit.');
}

export async function postProductReview(idProduit, payload) {
  const response = await fetch(`${API_BASE_URL}/reviews/products/${idProduit}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return parseResponse(response, 'Impossible d\'enregistrer cet avis produit.');
}

export async function fetchProfessionalReviews(idProfessionnel) {
  const response = await fetch(`${API_BASE_URL}/reviews/professionnels/${idProfessionnel}`, {
    credentials: 'include',
  });
  return parseResponse(response, 'Impossible de charger les avis producteur.');
}

export async function postProfessionalReview(idProfessionnel, payload) {
  const response = await fetch(`${API_BASE_URL}/reviews/professionnels/${idProfessionnel}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return parseResponse(response, 'Impossible d\'enregistrer cet avis producteur.');
}
