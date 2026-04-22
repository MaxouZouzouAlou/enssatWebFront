import React from 'react';

export default function CartItem({ item, onRemove = () => {}, onUpdate = () => {} }) {
  const p = item.product;
  const id = p.idProduit ?? p.id ?? p._id;
  const name = p.nom ?? p.name ?? p.title ?? 'Sans nom';
  const priceRaw = p.prix ?? p.price;
  const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw).toFixed(2) : '0.00';

  return (
    <div className="flex items-center justify-between border rounded p-3">
      <div>
        <div className="font-medium text-primary-700">{name}</div>
        <div className="text-sm text-neutral-600">{price} €</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onUpdate(id, Math.max(0, item.quantity - 1))} className="px-2 py-1 bg-neutral-200 rounded">-</button>
        <div className="px-3">{item.quantity}</div>
        <button onClick={() => onUpdate(id, item.quantity + 1)} className="px-2 py-1 bg-neutral-200 rounded">+</button>
        <button onClick={() => onRemove(id)} className="ml-3 text-sm text-red-600">Supprimer</button>
      </div>
    </div>
  );
}
