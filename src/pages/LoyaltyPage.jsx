import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { queryKeys } from '../utils/queryKeys.js';

function euro(value) {
  return `${Number(value || 0).toFixed(2)} EUR`;
}

export default function LoyaltyPage() {
  const { profileState, sessionState } = useAuthProfile();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const profile = profileState.data?.profile;
  const accountType = profile?.accountType || sessionState.data?.user?.accountType || null;
  const {
    data: loyalty,
    error: loyaltyError,
    isLoading: loading,
  } = useQuery({
    queryKey: queryKeys.loyalty.me,
    queryFn: fetchMyLoyalty,
  });

  useEffect(() => {
    setError(loyaltyError?.message || '');
  }, [loyaltyError]);

  const refreshLoyalty = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.loyalty.me });
  };

  const claimMutation = useMutation({
    mutationFn: claimLoyaltyChallenge,
    onSuccess: refreshLoyalty,
  });

  const redeemMutation = useMutation({
    mutationFn: redeemVoucher,
    onSuccess: refreshLoyalty,
  });

  const points = Number(loyalty?.pointsFidelite || 0);
  const voucherOptions = Array.isArray(loyalty?.voucherOptions) && loyalty.voucherOptions.length
    ? loyalty.voucherOptions
    : [
      { requiredPoints: 1000, rewardEuro: 5, remainingPoints: Math.max(1000 - points, 0), canRedeem: points >= 1000 },
      { requiredPoints: 2000, rewardEuro: 10, remainingPoints: Math.max(2000 - points, 0), canRedeem: points >= 2000 },
      { requiredPoints: 5000, rewardEuro: 25, remainingPoints: Math.max(5000 - points, 0), canRedeem: points >= 5000 },
      { requiredPoints: 10000, rewardEuro: 50, remainingPoints: Math.max(10000 - points, 0), canRedeem: points >= 10000 }
    ];
  const nextVoucher = loyalty?.prochainPalier || voucherOptions.find((option) => !option.canRedeem) || voucherOptions[voucherOptions.length - 1];
  const requiredPoints = Number(nextVoucher?.requiredPoints || 1000);
  const remaining = Number(loyalty?.prochainPalier?.remainingPoints || 0);

  const progressPct = useMemo(() => {
    if (requiredPoints <= 0) return 0;
    return Math.min((points / requiredPoints) * 100, 100);
  }, [points, requiredPoints]);

  if (!sessionState.isPending && accountType && accountType !== 'particulier') {
    return <Navigate to="/compte" replace />;
  }

  const onClaimChallenge = async (code) => {
    try {
      const result = await claimMutation.mutateAsync(code);
      setMessage(`Defi valide: +${result.challenge.pointsRecompense} points.`);
    } catch (err) {
      setError(err.message || 'Impossible de valider ce defi.');
    }
  };

  const onRedeemVoucher = async (pointsToSpend) => {
    try {
      const result = await redeemMutation.mutateAsync(pointsToSpend);
      setMessage(`Bon cree: ${result.voucher.codeBon} (${euro(result.voucher.valeurEuros)}).`);
    } catch (err) {
      setError(err.message || "Impossible de créer un bon d'achat.");
    }
  };

  return (
    <PageShell contentClassName="max-w-5xl">
      <SectionHeader eyebrow="Fidelite" title="Mes points et recompenses">
        <p>Suivez les points gagnés sur vos commandes et convertissez-les en bons d'achat utilisables au moment du paiement.</p>
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
                  Regle actuelle: 1 point tous les 2 EUR reellement payes apres reduction, arrondi a l'entier inferieur.
                </p>
              </SoftPanel>

              <SoftPanel className="space-y-3">
                <p className="text-sm font-semibold text-secondary-900">Convertir points en bon d'achat</p>
                <p className="text-sm text-neutral-600">
                  Choisissez un palier fixe a appliquer ensuite directement pendant le checkout.
                </p>
                <div className="grid gap-3">
                  {voucherOptions.map((option) => (
                    <div key={option.requiredPoints} className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3">
                      <div>
                        <p className="font-semibold text-secondary-900">{option.requiredPoints} points = {euro(option.rewardEuro)}</p>
                        <p className="text-sm text-neutral-600">
                          {option.canRedeem ? 'Disponible maintenant.' : `${option.remainingPoints} points manquants.`}
                        </p>
                      </div>
                      <ActionButton
                        type="button"
                        onClick={() => onRedeemVoucher(option.requiredPoints)}
                        className="h-10"
                        disabled={!option.canRedeem || redeemMutation.isPending}
                      >
                        Convertir
                      </ActionButton>
                    </div>
                  ))}
                </div>
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
                      disabled={!challenge.canClaim || claimMutation.isPending}
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
