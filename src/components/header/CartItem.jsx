import React, { useEffect, useState } from 'react';
import {
  displayValueToCartQuantity,
  formatCartQuantity,
  getDisplayConfig,
  getDisplayUnit,
  getProductId,
  isUnitProduct,
  quantityToDisplayValue,
} from '../../utils/cartQuantity.js';

function QuantityControl({ item, onRemove, onUpdate, compact = false }) {
  const product = item.product;
  const id = getProductId(product);
  const unitProduct = isUnitProduct(product);
  const [localQty, setLocalQty] = useState(quantityToDisplayValue(product, item.quantity));
  const [displayUnit, setDisplayUnit] = useState(getDisplayUnit(product, item.quantity));
  const config = unitProduct
    ? getDisplayConfig(product, item.quantity)
    : displayUnit === 'kg'
      ? { min: 1, step: 0.1, suffix: 'kg' }
      : { min: 100, step: 100, suffix: 'g' };

  useEffect(() => {
    setLocalQty(quantityToDisplayValue(product, item.quantity));
    setDisplayUnit(getDisplayUnit(product, item.quantity));
  }, [item.quantity, product]);

  const normalizeDisplay = (value) => {
    if (unitProduct) return { value: String(Math.max(1, Math.round(Number(value) || 1))), unit: 'u' };
    const parsed = Number(value);
    if (displayUnit === 'kg') {
      const kg = Math.max(1, parsed || 1);
      return { value: kg.toFixed(1), unit: 'kg' };
    }
    if (!Number.isFinite(parsed) || parsed < 1000) {
      return { value: String(Math.max(100, parsed || 100)), unit: 'g' };
    }
    return { value: (parsed / 1000).toFixed(1), unit: 'kg' };
  };

  const commitQuantity = async (value) => {
    const normalized = normalizeDisplay(value);
    const nextQuantity = displayValueToCartQuantity(product, normalized.value, normalized.unit);
    const currentQuantity = Number(item.quantity);

    setLocalQty(normalized.value);
    setDisplayUnit(normalized.unit);

    if (nextQuantity === currentQuantity) return;

    try {
      await onUpdate(id, nextQuantity);
    } catch {
      setLocalQty(quantityToDisplayValue(product, item.quantity));
      setDisplayUnit(getDisplayUnit(product, item.quantity));
    }
  };

  const changeByStep = async (direction) => {
    const displayValue = Number(localQty) || config.min;
    const nextDisplayValue = Math.max(config.min, Number((displayValue + direction * config.step).toFixed(3)));
    setLocalQty(String(nextDisplayValue));
    await commitQuantity(nextDisplayValue);
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="inline-flex h-8 items-center rounded-lg border border-neutral-200 bg-neutral-50 px-1 focus-within:ring-2 focus-within:ring-primary-400">
        <button
          type="button"
          onClick={() => changeByStep(-1)}
          className="grid h-6 w-6 place-items-center rounded-md text-secondary-600 transition hover:bg-neutral-200 hover:text-primary-700"
          aria-label="Diminuer la quantite"
        >
          <span className="material-symbols-rounded text-sm">remove</span>
        </button>
        <input
          type="number"
          value={localQty}
          step={config.step}
          min={config.min}
          onChange={(event) => setLocalQty(event.target.value)}
          onBlur={(event) => commitQuantity(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') commitQuantity(event.target.value); }}
          aria-label={unitProduct ? 'Quantite en unites' : 'Quantite en poids'}
          className={`no-number-spinner ${compact ? 'w-10' : 'w-12'} h-6 border-0 bg-transparent px-1 text-center text-xs font-semibold text-secondary-900 focus:outline-none`}
        />
        <span className="pr-1 text-[11px] font-semibold text-secondary-500">{displayUnit}</span>
        <button
          type="button"
          onClick={() => changeByStep(1)}
          className="grid h-6 w-6 place-items-center rounded-md text-secondary-600 transition hover:bg-neutral-200 hover:text-primary-700"
          aria-label="Augmenter la quantite"
        >
          <span className="material-symbols-rounded text-sm">add</span>
        </button>
      </div>
      <button
        type="button"
        onClick={async () => {
          try { await onRemove(id); } catch {}
        }}
        className="grid h-8 w-8 place-items-center rounded-lg text-red-600 transition hover:bg-red-50"
        aria-label="Supprimer le produit du panier"
      >
        <span className="material-symbols-rounded text-lg">delete</span>
      </button>
    </div>
  );
}

export default function CartItem({ item, onRemove = () => {}, onUpdate = () => {}, compact = false }) {
  const product = item.product;
  const name = product.nom ?? product.name ?? product.title ?? 'Sans nom';
  const priceRaw = product.prix ?? product.price;
  const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw) : 0;
  const lineTotal = price * Number(item.quantity || 0);

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-secondary-900">{name}</p>
          <p className="text-[11px] font-semibold text-primary-700">{lineTotal.toFixed(2)} €</p>
        </div>
        <QuantityControl item={item} onRemove={onRemove} onUpdate={onUpdate} compact />
      </div>
    );
  }

  return (
    <article className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-secondary-900">{name}</h3>
          <p className="mt-0.5 text-xs text-secondary-500">
            {formatCartQuantity(product, item.quantity)} · {price.toFixed(2)} € / {isUnitProduct(product) ? 'u' : 'kg'}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-sm font-bold text-primary-700">{lineTotal.toFixed(2)} €</p>
          <QuantityControl item={item} onRemove={onRemove} onUpdate={onUpdate} />
        </div>
      </div>
    </article>
  );
}
