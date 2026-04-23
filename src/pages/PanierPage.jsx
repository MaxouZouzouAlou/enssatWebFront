import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import Alert from '../components/Alert.jsx';
import { ActionButton } from '../components/Button.jsx';
import CartItem from '../components/header/CartItem';
import PageShell from '../components/layout/PageShell.jsx';
import SectionHeader from '../components/layout/SectionHeader.jsx';
import SurfaceCard from '../components/layout/SurfaceCard.jsx';
import { checkoutCurrentCart } from '../services/orders-client.js';
import { fetchMyLoyalty } from '../services/loyalty-client.js';

function estimateLineTotal(item) {
	const quantity = Number(item.quantity || 0);
	const price = Number(item.product.prix ?? item.product.price ?? 0);
	const vatRate = Number(item.product.tva || 0) / 100;
	const discountRate = Number(item.product.reductionProfessionnel || 0) / 100;
	const discountedUnitPrice = price * (1 - discountRate);
	return quantity * discountedUnitPrice * (1 + vatRate);
}

function PanierPage() {
	const navigate = useNavigate();
	const {
		cartError,
		cartItems,
		clearCartError,
		removeFromCart,
		updateQuantity,
		isAuthenticated,
		accountType
	} = useOutletContext();
	const [checkoutError, setCheckoutError] = useState('');
	const [checkoutSuccess, setCheckoutSuccess] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [modeLivraison, setModeLivraison] = useState('domicile');
	const [voucherError, setVoucherError] = useState('');
	const [voucherLoading, setVoucherLoading] = useState(false);
	const [vouchers, setVouchers] = useState([]);
	const [selectedVoucherId, setSelectedVoucherId] = useState('');
	const total = useMemo(
		() => cartItems.reduce((sum, item) => sum + estimateLineTotal(item), 0),
		[cartItems]
	);
	const isParticulier = accountType === 'particulier';
	const activeVouchers = useMemo(
		() => vouchers.filter((voucher) => {
			if (voucher.statut !== 'actif') return false;
			if (!voucher.dateExpiration) return true;
			return new Date(voucher.dateExpiration).getTime() > Date.now();
		}),
		[vouchers]
	);
	const selectedVoucher = useMemo(
		() => activeVouchers.find((voucher) => Number(voucher.idBon) === Number(selectedVoucherId)) || null,
		[activeVouchers, selectedVoucherId]
	);
	const totalAfterVoucher = useMemo(
		() => Math.max(total - Number(selectedVoucher?.valeurEuros || 0), 0),
		[total, selectedVoucher]
	);

	useEffect(() => {
		let mounted = true;

		if (!isAuthenticated || !isParticulier) {
			setVouchers([]);
			setVoucherError('');
			setSelectedVoucherId('');
			return () => {
				mounted = false;
			};
		}

		(async () => {
			setVoucherLoading(true);
			try {
				const loyalty = await fetchMyLoyalty();
				if (!mounted) return;
				setVouchers(Array.isArray(loyalty?.vouchers) ? loyalty.vouchers : []);
				setVoucherError('');
			} catch (error) {
				if (!mounted) return;
				setVoucherError(error.message || 'Impossible de charger vos bons.');
				setVouchers([]);
			} finally {
				if (mounted) setVoucherLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [isAuthenticated, isParticulier]);

	const submitCheckout = async () => {
		if (!isAuthenticated) {
			navigate('/login');
			return;
		}

		setIsSubmitting(true);
		setCheckoutError('');
		setCheckoutSuccess(null);

		try {
			const result = await checkoutCurrentCart({
				modeLivraison,
				voucherId: selectedVoucher ? Number(selectedVoucher.idBon) : undefined
			});
			await Promise.all(
				cartItems.map((item) => updateQuantity(item.product.idProduit ?? item.product.id, 0))
			);
			if (selectedVoucher) {
				setVouchers((current) => current.map((voucher) => (
					Number(voucher.idBon) === Number(selectedVoucher.idBon)
						? { ...voucher, statut: 'utilise' }
						: voucher
				)));
				setSelectedVoucherId('');
			}
			setCheckoutSuccess({
				...result.order,
				gainedPoints: result.loyalty?.gainedPoints ?? null
			});
		} catch (error) {
			setCheckoutError(error.message || 'Impossible de valider la commande.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<PageShell contentClassName="max-w-4xl">
			<SectionHeader eyebrow="Commande" title="Votre panier">
				<p>Retrouvez les produits sélectionnés avant de choisir votre mode de récupération.</p>
			</SectionHeader>
			{cartError && (
				<div className="mt-6">
					<Alert>
						<div className="flex items-start justify-between gap-4">
							<span>{cartError}</span>
							<button
								type="button"
								onClick={clearCartError}
								className="text-xs font-semibold uppercase tracking-[0.12em] text-red-800 hover:text-red-950"
							>
								Fermer
							</button>
						</div>
					</Alert>
				</div>
			)}
			{checkoutError ? (
				<div className="mt-6">
					<Alert>{checkoutError}</Alert>
				</div>
			) : null}
			{checkoutSuccess ? (
				<div className="mt-6">
					<Alert type="success">
						Commande #{checkoutSuccess.idCommande} enregistrée pour un total de {checkoutSuccess.prixTotal.toFixed(2)} €.
						{typeof checkoutSuccess.gainedPoints === 'number'
							? ` ${checkoutSuccess.gainedPoints} point(s) de fidelite gagnes.`
							: ''}
					</Alert>
				</div>
			) : null}

			<SurfaceCard className="mt-8">
				{cartItems.length === 0 ? (
					<div className="space-y-3 py-10 text-center text-neutral-600">
						<p>Votre panier est vide.</p>
						{checkoutSuccess ? (
							<p className="text-sm text-primary-700">Votre commande est confirmée. Vous pouvez continuer vos achats.</p>
						) : null}
					</div>
				) : (
					<div className="space-y-4">
						{cartItems.map((it, idx) => (
							<CartItem
								key={it.product.idProduit ?? it.product.id ?? it.product._id ?? idx}
								item={it}
								onRemove={removeFromCart}
								onUpdate={updateQuantity}
							/>
						))}

						<div className="flex items-center justify-between rounded-2xl bg-primary-50 px-4 py-3">
							<div className="text-lg font-semibold text-secondary-900">Total estimé</div>
							<div className="text-lg font-bold text-primary-700">{total.toFixed(2)} €</div>
						</div>
						{selectedVoucher ? (
							<div className="flex items-center justify-between rounded-2xl bg-secondary-50 px-4 py-3">
								<div>
									<p className="text-sm font-semibold text-secondary-900">Bon appliqué: {selectedVoucher.codeBon}</p>
									<p className="text-sm text-neutral-600">Réduction de {Number(selectedVoucher.valeurEuros || 0).toFixed(2)} €.</p>
								</div>
								<div className="text-lg font-bold text-primary-700">{totalAfterVoucher.toFixed(2)} €</div>
							</div>
						) : null}

						<div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
							<div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
								<label className="block text-sm font-semibold text-secondary-900" htmlFor="mode-livraison">
									Mode de récupération
									<select
										id="mode-livraison"
										value={modeLivraison}
										onChange={(event) => setModeLivraison(event.target.value)}
										className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-secondary-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
									>
										<option value="domicile">Livraison à domicile</option>
										<option value="point_relais">Point relais</option>
										<option value="lieu_vente">Retrait sur place</option>
									</select>
								</label>
								<label className="block text-sm font-semibold text-secondary-900" htmlFor="voucher-id">
									Bon d'achat
									<select
										id="voucher-id"
										value={selectedVoucherId}
										onChange={(event) => setSelectedVoucherId(event.target.value)}
										className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-secondary-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
										disabled={!isAuthenticated || !isParticulier || voucherLoading || activeVouchers.length === 0}
									>
										<option value="">Aucun bon</option>
										{activeVouchers.map((voucher) => (
											<option key={voucher.idBon} value={voucher.idBon}>
												{voucher.codeBon} - {Number(voucher.valeurEuros || 0).toFixed(2)} €
											</option>
										))}
									</select>
								</label>

								<ActionButton
									type="button"
									onClick={submitCheckout}
									loading={isSubmitting}
									className="w-full sm:w-auto"
								>
									Valider la commande
								</ActionButton>
							</div>
							{voucherLoading ? (
								<p className="mt-3 text-sm text-neutral-600">Chargement des bons disponibles...</p>
							) : null}
							{voucherError ? (
								<p className="mt-3 text-sm text-red-700">{voucherError}</p>
							) : null}
							{isAuthenticated && isParticulier && !voucherLoading && !voucherError && activeVouchers.length === 0 ? (
								<p className="mt-3 text-sm text-neutral-600">Aucun bon actif disponible pour cette commande.</p>
							) : null}
							{!isAuthenticated ? (
								<p className="mt-3 text-sm text-neutral-600">
									Connectez-vous pour transformer ce panier en commande réelle.
								</p>
							) : null}
						</div>
					</div>
				)}
			</SurfaceCard>
		</PageShell>
	);
}

export default PanierPage;
