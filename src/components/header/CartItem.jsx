import React, { useState, useEffect } from 'react';
import shoppingCartService from '../../services/shoppingCart';

export default function CartItem({ item, onRemove = () => {}, onUpdate = () => {} }) {
  const p = item.product;
  const id = p.idProduit ?? p.id ?? p._id;
  const name = p.nom ?? p.name ?? p.title ?? 'Sans nom';
  const priceRaw = p.prix ?? p.price;
  const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw).toFixed(2) : '0.00';

  const [localQty, setLocalQty] = useState(String(item.quantity));

  useEffect(() => {
    setLocalQty(String(item.quantity));
  }, [item.quantity]);

  const step = (p.unitaireOuKilo === 1 || p.unitaireOuKilo === true) ? 1 : 0.1;

  const commitQuantity = async (value) => {
    const newQty = Number.parseFloat(value);
    if (Number.isNaN(newQty)) {
      setLocalQty(String(item.quantity));
      return;
    }
    const roundedQty = Math.round(newQty / step) * step;
    const currentQty = Number(item.quantity);
    if (roundedQty === currentQty) {
      setLocalQty(String(currentQty));
      return;
    }
    try {
      if (roundedQty <= 0) {
        await shoppingCartService.removerProductsFromShoppingCart(6, id);
        onRemove(id);
        return;
      }
      const delta = roundedQty - currentQty;
      if (delta > 0) {
        await shoppingCartService.addProductToShoppingCart(6, id, delta);
      } else {
        await shoppingCartService.removeProductFromShoppingCart(6, id, -delta);
      }
      onUpdate(id, roundedQty);
    } catch (err) {
      console.error('Failed to update product quantity', err);
      setLocalQty(String(item.quantity));
    }
  };

  return (
    <div className="flex items-center justify-between border rounded p-3">
      <div>
        <div className="font-medium text-green-800">{name}</div>
        <div className="text-sm text-gray-600">{price} €</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={async () => {
            try {
              await shoppingCartService.removeProductFromShoppingCart(6, id, step);
              const newQty = Math.max(0, Number(item.quantity) - step);
              if (newQty <= 0) {
                onRemove(id);
              } else {
                onUpdate(id, newQty);
              }
            } catch (err) {
              console.error('Failed to remove product from shopping cart', err);
            }
          }}
          className="px-2 py-1 bg-gray-100 rounded"
        >
          -
        </button>

        <input
          type="number"
          value={localQty}
          step={step}
          min={step}
          onChange={(e) => setLocalQty(e.target.value)}
          onBlur={(e) => commitQuantity(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commitQuantity(e.target.value); }}
          className="w-20 text-center border rounded px-2 py-1"
        />

        <button
          onClick={async () => {
            try {
              await shoppingCartService.addProductToShoppingCart(6, id, step);
              onUpdate(id, Number(item.quantity) + step);
            } catch (err) {
              console.error('Failed to add product to shopping cart', err);
            }
          }}
          className="px-2 py-1 bg-gray-100 rounded"
        >
          +
        </button>

        <button
          onClick={async () => {
            try {
              await shoppingCartService.removerProductsFromShoppingCart(6, id);
              onRemove(id);
            } catch (err) {
              console.error('Failed to remove all products from shopping cart', err);
            }
          }}
          className="ml-3 text-sm text-red-600"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
