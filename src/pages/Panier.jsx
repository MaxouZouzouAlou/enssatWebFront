import React from 'react';
import CartItem from '../components/header/CartItem';

function Panier({ items = [] }) {
  const total = items.reduce((s, it) => {
    const priceRaw = it.product.prix ?? it.product.price;
    const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw) : 0;
    return s + price * it.quantity;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Panier</h1>

      {items.length === 0 ? (
        <div className="text-gray-600">Votre panier est vide.</div>
      ) : (
        <div className="space-y-4">
          {items.map((it, idx) => (
            <CartItem key={it.product.idProduit ?? it.product.id ?? it.product._id ?? idx} item={it} />
          ))}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-lg font-semibold">Total</div>
            <div className="text-lg font-bold text-green-800">{total.toFixed(2)} €</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Panier;
