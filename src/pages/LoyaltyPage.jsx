import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router';
import { ActionButton } from '../components/Button.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SoftPanel from '../components/layout/SoftPanel.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import useAuthProfile from '../features/auth/useAuthProfile';
import {
  claimLoyaltyChallenge,
  fetchMyLoyalty,
  redeemVoucher,
} from '../services/loyalty-client.js';

function euro(value) {
  return `${Number(value || 0).toFixed(2)} EUR`;
}

export default function LoyaltyPage() {
  const { profileState, sessionState } = useAuthProfile();
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const profile = profileState.data?.profile;
  const accountType = profile?.accountType || sessionState.data?.user?.accountType || null;

  const loadLoyalty = async () => {
    setLoading(true);
    try {
      const data = await fetchMyLoyalty();
      setLoyalty(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Impossible de recuperer vos donnees fidelite.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoyalty();
  }, []);

  const points = Number(loyalty?.pointsFidelite || 0);
  const remaining = Number(loyalty?.prochainPalier?.remainingPoints || 0);

  const progressPct = useMemo(() => {
    const required = Number(loyalty?.prochainPalier?.requiredPoints || 500);
    if (required <= 0) return 0;
    return Math.min((points / required) * 100, 100);
  }, [loyalty, points]);

  if (!sessionState.isPending && accountType && accountType !== 'particulier') {
    return <Navigate to="/compte" replace />;
  }

  const onClaimChallenge = async (code) => {
    try {
      const result = await claimLoyaltyChallenge(code);
      setMessage(`Defi valide: +${result.challenge.pointsRecompense} points.`);
      await loadLoyalty();
    } catch (err) {
      setError(err.message || 'Impossible de valider ce defi.');
    }
  };

  const onRedeemVoucher = async () => {
    try {
      const result = await redeemVoucher(500);
      setMessage(`Bon cree: ${result.voucher.codeBon} (${euro(result.voucher.valeurEuros)}).`);
      await loadLoyalty();
    } catch (err) {
      setError(err.message || 'Impossible de creer un bon d\'achat.');
    }
  };

  return (
    <PageShell contentClassName="max-w-5xl">
      <SectionHeader eyebrow="Fidelite" title="Mes points et recompenses">
        <p>Gagnez des points sur vos achats, relevez des defis simples et convertissez vos points en bons d'achat.</p>
      </SectionHeader>

      <SurfaceCard className="mt-8 p-5 sm:p-8">
        {loading ? <p className="text-sm text-neutral-600">Chargement de votre fidelite...</p> : null}
        {error ? <p className="mb-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {message ? <p className="mb-3 text-sm font-semibold text-primary-700">{message}</p> : null}

        {!loading && loyalty ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <SoftPanel>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Points disponibles</p>
                <p className="mt-2 text-3xl font-bold text-secondary-900">{points}</p>
              </SoftPanel>
              <SoftPanel>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Palier bon d'achat</p>
                <p className="mt-2 text-2xl font-semibold text-secondary-900">
                  {loyalty.prochainPalier.requiredPoints} pts = {euro(loyalty.prochainPalier.rewardEuro)}
                </p>
              </SoftPanel>
              <SoftPanel>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Points restants</p>
                <p className="mt-2 text-2xl font-semibold text-secondary-900">{remaining}</p>
              </SoftPanel>
            </div>

            <div className="mt-6">
              <div className="h-2 rounded-full bg-neutral-200">
                <div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="mt-2 text-sm text-neutral-600">Progression vers le prochain bon: {Math.round(progressPct)}%</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <SoftPanel className="space-y-3">
                <p className="text-sm font-semibold text-secondary-900">Gagner des points via une commande</p>
                <p className="text-sm text-neutral-600">
                  Les points sont maintenant attribues automatiquement lors de la validation d'une commande reelle.
                </p>
                <p className="text-sm text-neutral-600">
                  Regle actuelle: 1 point par euro reellement paye, arrondi a l'entier inferieur.
                </p>
              </SoftPanel>

              <SoftPanel className="space-y-3">
                <p className="text-sm font-semibold text-secondary-900">Convertir points en bon d'achat</p>
                <p className="text-sm text-neutral-600">500 points = 5 EUR de reduction sur une commande.</p>
                <ActionButton type="button" onClick={onRedeemVoucher} className="h-10" disabled={points < 500}>
                  Convertir 500 points
                </ActionButton>
              </SoftPanel>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-secondary-900">Defis fidelite</h2>
              <div className="mt-3 grid gap-3">
                {(loyalty.challenges || []).map((challenge) => (
                  <SoftPanel key={challenge.code} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-secondary-900">{challenge.titre}</p>
                      <p className="text-sm text-neutral-600">{challenge.description}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        +{challenge.pointsRecompense} pts • {challenge.claimsCount}/{challenge.maxClaims} validation(s)
                      </p>
                    </div>
                    <ActionButton
                      type="button"
                      onClick={() => onClaimChallenge(challenge.code)}
                      disabled={!challenge.canClaim}
                      className="h-10"
                    >
                      {challenge.canClaim ? 'Valider le defi' : 'Defi termine'}
                    </ActionButton>
                  </SoftPanel>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-secondary-900">Mes bons d'achat</h2>
              <div className="mt-3 grid gap-3">
                {(loyalty.vouchers || []).length ? (
                  loyalty.vouchers.map((voucher) => (
                    <SoftPanel key={voucher.idBon} className="flex flex-col gap-1">
                      <p className="font-semibold text-secondary-900">{voucher.codeBon}</p>
                      <p className="text-sm text-neutral-600">
                        Valeur: {euro(voucher.valeurEuros)} • Statut: {voucher.statut}
                      </p>
                      <p className="text-xs text-neutral-500">Expire le: {voucher.dateExpiration ? new Date(voucher.dateExpiration).toLocaleDateString('fr-FR') : 'N/A'}</p>
                    </SoftPanel>
                  ))
                ) : (
                  <p className="text-sm text-neutral-600">Aucun bon disponible pour le moment.</p>
                )}
              </div>
            </div>

          </>
        ) : null}
      </SurfaceCard>
    </PageShell>
  );
}
