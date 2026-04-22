import React from 'react';
import { useNavigate } from 'react-router';
import CartItem from './CartItem';

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
      <div className="relative z-10 mx-4 w-full max-w-2xl rounded-2xl bg-neutral-50 p-6 shadow-[0_24px_70px_rgba(29,52,34,.22)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary-700">Votre panier</h2>
          <button onClick={onClose} className="text-sm text-neutral-600">Fermer</button>
        </div>

        {items.length === 0 ? (
          <div className="text-center text-neutral-600 py-8">Votre panier est vide.</div>
        ) : (
          <div className="space-y-4">
            {items.map((it, idx) => (
              <CartItem
                key={it.product.idProduit ?? it.product.id ?? it.product._id ?? idx}
                item={it}
                onRemove={removeItem}
                onUpdate={updateQuantity}
              />
            ))}

            <div className="flex items-center justify-between rounded-2xl bg-neutral-100 px-4 py-3">
              <div className="text-lg font-semibold">Total</div>
              <div className="text-lg font-bold text-primary-700">{total.toFixed(2)} €</div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  onClose();
                  navigate('/panier');
                }}
                className="rounded-xl bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700"
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
