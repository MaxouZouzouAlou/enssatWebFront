import React from 'react';
import shoppingCartService from '../../services/shoppingCart';

export default function CartItem({ item, onRemove = () => {}, onUpdate = () => {} }) {
  const p = item.product;
  const id = p.idProduit ?? p.id ?? p._id;
  const name = p.nom ?? p.name ?? p.title ?? 'Sans nom';
  const priceRaw = p.prix ?? p.price;
  const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw).toFixed(2) : '0.00';

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
              await shoppingCartService.removeProductFromShoppingCart(6, id);
              const newQty = Math.max(0, item.quantity - 1);
              if (newQty === 0) {
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
        <div className="px-3">{item.quantity}</div>
        <button
          onClick={async () => {
            try {
              await shoppingCartService.addProductToShoppingCart(6, id);
              onUpdate(id, item.quantity + 1);
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
