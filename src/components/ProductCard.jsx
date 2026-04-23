import React, { useEffect, useState } from 'react';
import { ActionButton } from './Button.jsx';
import {
  displayValueToCartQuantity,
  formatProductStock,
  getQuantityInputConfig,
  isUnitProduct,
  normalizeWeightInput,
} from '../utils/cartQuantity.js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:49161';

const categoryStyles = {
  Fruit: 'bg-pink-100 text-pink-900',
  Légume: 'bg-emerald-100 text-emerald-900',
  Legume: 'bg-emerald-100 text-emerald-900',
  Viande: 'bg-orange-100 text-orange-950',
  Boulangerie: 'bg-amber-100 text-amber-950',
  Poisson: 'bg-sky-100 text-sky-900',
  Laitier: 'bg-indigo-100 text-indigo-900',
  Autre: 'bg-neutral-100 text-secondary-900',
};

const categoryNameColors = {
  Fruit: 'text-pink-950',
  Légume: 'text-emerald-950',
  Legume: 'text-emerald-950',
  Viande: 'text-orange-950',
  Boulangerie: 'text-amber-950',
  Poisson: 'text-sky-950',
  Laitier: 'text-indigo-950',
  Autre: 'text-secondary-900',
};

function getProductImage(product) {
  return product.imagePath ?? product.image ?? product.path ?? product.imageUrl ?? null;
}

function getCompanyName(product) {
  const candidates = [
    product.entrepriseNom,
    product.nomEntreprise,
    product.raisonSociale,
    product.entreprise?.nom,
    product.entreprise?.nomEntreprise,
    product.professionnel?.entrepriseNom,
    product.professionnel?.nomEntreprise,
    product.professionnel?.nom,
    typeof product.professionnel === 'string' ? product.professionnel : null,
    typeof product.producteur === 'string' ? product.producteur : null,
    product.sellerName,
  ];

  const found = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  return found?.trim() || 'Entreprise non renseignee';
}

function resolveProductImageUrl(imageValue) {
  if (!imageValue || typeof imageValue !== 'string') return null;
  const trimmed = imageValue.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
  const base = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${normalizedPath}`;
}

function QuantityStepper({ label, min, step, suffix, value, onBlur, onChange }) {
  const numericValue = Number(value) || min;
  const update = (nextValue) => onChange(String(Math.max(min, nextValue)));

  return (
    <div className="inline-flex h-9 items-center rounded-full bg-neutral-100 px-2 focus-within:ring-2 focus-within:ring-primary-400">
      <button
        type="button"
        onClick={() => update(numericValue - step)}
        className="grid h-7 w-7 place-items-center rounded-full text-secondary-700 transition hover:bg-neutral-200 hover:text-primary-700"
        aria-label={`Diminuer ${label}`}
      >
        <span className="material-symbols-rounded text-base">remove</span>
      </button>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur ?? (() => update(Number(value) || min))}
        aria-label={label}
        className="no-number-spinner h-7 w-10 border-0 bg-transparent px-1 text-center text-sm font-semibold text-secondary-900 focus:outline-none"
      />
      <span className="pr-1 text-xs font-semibold text-secondary-500">{suffix}</span>
      <button
        type="button"
        onClick={() => update(numericValue + step)}
        className="grid h-7 w-7 place-items-center rounded-full text-secondary-700 transition hover:bg-neutral-200 hover:text-primary-700"
        aria-label={`Augmenter ${label}`}
      >
        <span className="material-symbols-rounded text-base">add</span>
      </button>
    </div>
  );
}

export default function ProductCard({ product, onAdd = () => {}, onOpenReviews = () => {}, onOpenProduct = null }) {
  const name = product.nom ?? product.name ?? product.title ?? 'Sans nom';
  const priceRaw = product.prix ?? product.price;
  const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw).toFixed(2) : null;
  const category = product.nature ?? 'Autre';
  const producer = getCompanyName(product);
  const stock = product.stock ?? null;
  const bio = product.bio === 1 || product.bio === '1' || product.bio === true;
  const visible = product.visible === 1 || product.visible === '1' || product.visible === true;
  const noteMoyenneProduit = Number(product.noteMoyenneProduit ?? 0);
  const nombreAvisProduit = Number(product.nombreAvisProduit ?? 0);
  const noteMoyenneProducteur = Number(product.noteMoyenneProducteur ?? 0);
  const nombreAvisProducteur = Number(product.nombreAvisProducteur ?? 0);
  const unitProduct = isUnitProduct(product);
  const config = getQuantityInputConfig(product);
  const [quantityInput, setQuantityInput] = useState(unitProduct ? '1' : '100');
  const [quantityUnit, setQuantityUnit] = useState(config.suffix);
  const [imageError, setImageError] = useState(false);
  const cartQuantity = displayValueToCartQuantity(product, quantityInput, quantityUnit);
  const image = resolveProductImageUrl(getProductImage(product));
  const stockLabel = formatProductStock(product, stock);
  const canOpenProduct = typeof onOpenProduct === 'function';

  useEffect(() => {
    setImageError(false);
  }, [image]);

  const normalizeWeight = () => {
    if (unitProduct) return;
    const normalized = normalizeWeightInput(quantityInput);
    setQuantityInput(normalized.value);
    setQuantityUnit(normalized.unit);
  };

  const handleOpenProduct = () => {
    onOpenProduct(product);
  };

  return (
    <article
      className="overflow-hidden rounded-xl bg-[#fbf7ee] shadow-[0_14px_35px_rgba(29,52,34,.09)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(29,52,34,.14)]"
      role={canOpenProduct ? 'button' : undefined}
      tabIndex={canOpenProduct ? 0 : undefined}
      aria-label={canOpenProduct ? `Voir le produit ${name}` : undefined}
      onClick={canOpenProduct ? handleOpenProduct : undefined}
      onKeyDown={
        canOpenProduct
          ? (event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							handleOpenProduct();
						}
					}
          : undefined
      }
    >
      <div className="relative aspect-[5/3] bg-gradient-to-br from-primary-100 via-neutral-100 to-secondary-100">
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ${categoryStyles[category] || categoryStyles.Autre}`}>
          {category}
        </span>
        {bio && (
          <span
            className="group absolute bottom-3 right-3 flex h-9 w-9 items-center justify-end overflow-hidden rounded-full bg-primary-600 text-white shadow-lg transition-all duration-200 hover:w-20"
            title="Produit bio"
            aria-label="Produit bio"
          >
            <span className="w-0 overflow-hidden whitespace-nowrap pl-0 text-xs font-bold opacity-0 transition-all duration-200 group-hover:w-9 group-hover:pl-3 group-hover:opacity-100">
              Bio
            </span>
            <span className="grid h-9 w-9 shrink-0 place-items-center">
              <span className="material-symbols-rounded text-xl">eco</span>
            </span>
          </span>
        )}
        {image && !imageError ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary-700/60">
            <span className="material-symbols-rounded text-6xl">local_florist</span>
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className={`truncate text-lg font-semibold leading-tight ${categoryNameColors[category] || categoryNameColors.Autre}`}>{name}</h2>
            <p className="mt-1.5 truncate text-sm font-medium text-secondary-500">{producer}</p>
          </div>
          <div className="shrink-0 text-right">
            {price != null ? (
              <p className="text-lg font-bold leading-tight text-primary-700">
                {price}€
                <span className="ml-1 text-xs font-semibold text-secondary-400">{unitProduct ? '/u' : '/kg'}</span>
              </p>
            ) : (
              <span className="text-sm text-secondary-400">Prix n/d</span>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {stockLabel && (
              <p className="truncate text-xs font-medium text-secondary-500">
                {stockLabel}
              </p>
            )}
            {!visible && (
              <p className="truncate text-xs font-semibold text-amber-700">
                Produit masque
              </p>
            )}
            <p className="text-xs font-medium text-secondary-500">
              Produit {noteMoyenneProduit.toFixed(1)}/5 ({nombreAvisProduit}) - Producteur {noteMoyenneProducteur.toFixed(1)}/5 ({nombreAvisProducteur})
            </p>
            <QuantityStepper
              label={unitProduct ? 'Quantite en unites' : 'Quantite en poids'}
              min={quantityUnit === 'kg' ? 1 : config.min}
              step={quantityUnit === 'kg' ? 0.1 : config.step}
              suffix={quantityUnit}
              value={quantityInput}
              onBlur={normalizeWeight}
              onChange={(value) => {
                setQuantityInput(value);
                if (!unitProduct && quantityUnit === 'kg' && Number(value) < 1) setQuantityUnit('g');
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="secondary"
              className="h-10 w-10 rounded-full p-0"
              aria-label="Voir et noter"
              onClick={(event) => {
					event.stopPropagation();
					onOpenReviews(product);
				}}
            >
              <span className="material-symbols-rounded text-xl">reviews</span>
            </ActionButton>
            <ActionButton
              variant="primary"
              className="h-10 w-10 rounded-full p-0 shadow-lg"
              aria-label="Ajouter au panier"
              onClick={async (event) => {
					event.stopPropagation();
                try { await onAdd(product, cartQuantity); } catch (err) { console.error(err); }
              }}
            >
              <span className="material-symbols-rounded text-2xl">shopping_bag</span>
            </ActionButton>
          </div>
        </div>
      </div>
    </article>
  );
}
