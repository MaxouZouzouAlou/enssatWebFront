import React from 'react';
import CartItem from '../components/header/CartItem';
import { Link } from 'react-router-dom';

function Panier({ items = [], removeItem = () => {}, updateQuantity = () => {} }) {
  const total = items.reduce((s, it) => {
    const priceRaw = it.product.prix ?? it.product.price;
    const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw) : 0;
    return s + price * it.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-green-800">Votre panier</h1>
          <p className="text-sm text-green-600">Vérifiez les articles et les quantités avant validation</p>
        </div>

        {items.length === 0 ? (
          <div className="text-gray-600">Votre panier est vide.</div>
        ) : (
          <div className="space-y-4 bg-white/80 p-6 rounded-lg shadow-sm">
            <div className="space-y-3">
              {items.map((it, idx) => (
                <CartItem
                  key={it.product.idProduit ?? it.product.id ?? it.product._id ?? idx}
                  item={it}
                  onRemove={removeItem}
                  onUpdate={updateQuantity}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold text-green-800">{total.toFixed(2)} €</div>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/" className="px-4 py-2 border rounded text-sm">Continuer mes achats</Link>
                <button className="bg-green-600 text-white px-4 py-2 rounded text-sm">Valider la commande</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Panier;
