import { requestJson } from './http-client.js';

export async function fetchProductReviews(idProduit) {
  return requestJson(`/reviews/products/${idProduit}`, {
    defaultMessage: 'Impossible de charger les avis produit.'
  });
}

export async function postProductReview(idProduit, payload) {
  return requestJson(`/reviews/products/${idProduit}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    defaultMessage: 'Impossible d\'enregistrer cet avis produit.'
  });
}

export async function fetchProfessionalReviews(idProfessionnel) {
  return requestJson(`/reviews/professionnels/${idProfessionnel}`, {
    defaultMessage: 'Impossible de charger les avis producteur.'
  });
}

export async function postProfessionalReview(idProfessionnel, payload) {
  return requestJson(`/reviews/professionnels/${idProfessionnel}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    defaultMessage: 'Impossible d\'enregistrer cet avis producteur.'
  });
}
