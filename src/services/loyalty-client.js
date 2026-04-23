import { API_BASE_URL } from './auth-client.js';

async function parseResponse(response, defaultMessage) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || defaultMessage);
  }
  return data;
}

export async function fetchMyLoyalty() {
  const response = await fetch(`${API_BASE_URL}/loyalty/me`, {
    credentials: 'include',
  });
  return parseResponse(response, 'Impossible de charger la fidelite.');
}

export async function claimLoyaltyChallenge(code) {
  const response = await fetch(`${API_BASE_URL}/loyalty/challenges/${encodeURIComponent(code)}/claim`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return parseResponse(response, 'Impossible de valider le defi.');
}

export async function redeemVoucher(pointsToSpend = 500) {
  const response = await fetch(`${API_BASE_URL}/loyalty/redeem-voucher`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pointsToSpend }),
  });
  return parseResponse(response, 'Impossible de convertir les points en bon.');
}
