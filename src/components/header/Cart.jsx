import React from 'react';
import CartItem from './CartItem';
import { useNavigate } from 'react-router-dom';

function Cart({ items = [], onClose = () => {}, removeItem = () => {}, updateQuantity = () => {} }) {
  const navigate = useNavigate();
  const total = items.reduce((s, it) => {
    const priceRaw = it.product.prix ?? it.product.price;
    const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw) : 0;
    return s + price * it.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-green-800">Votre panier</h2>
          <button onClick={onClose} className="text-sm text-gray-600">Fermer</button>
        </div>

        {items.length === 0 ? (
          <div className="text-center text-gray-600 py-8">Votre panier est vide.</div>
        ) : (
          <div className="space-y-4">
            {items.map((it, idx) => (
              <CartItem key={it.product.idProduit ?? it.product.id ?? it.product._id ?? idx} item={it} onRemove={removeItem} onUpdate={updateQuantity} />
            ))}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-lg font-semibold">Total</div>
              <div className="text-lg font-bold text-green-800">{total.toFixed(2)} €</div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  onClose();
                  navigate('/panier');
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Passer la commande
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
