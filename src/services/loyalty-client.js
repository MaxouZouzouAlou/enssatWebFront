import { requestJson } from './http-client.js';

export async function fetchMyLoyalty() {
  return requestJson('/loyalty/me', {
    defaultMessage: 'Impossible de charger la fidélité.'
  });
}

export async function claimLoyaltyChallenge(code) {
  return requestJson(`/loyalty/challenges/${encodeURIComponent(code)}/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    defaultMessage: 'Impossible de valider le défi.'
  });
}

export async function redeemVoucher(pointsToSpend = 1000) {
  return requestJson('/loyalty/redeem-voucher', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pointsToSpend }),
    defaultMessage: 'Impossible de convertir les points en bon.'
  });
}
