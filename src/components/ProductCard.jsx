import React, { useState } from 'react';

export default function ProductCard({ product, onAdd = () => {} }) {
  const name = product.nom ?? product.name ?? product.title ?? 'Sans nom';
  const priceRaw = product.prix ?? product.price;
  const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw).toFixed(2) : null;
  const nature = product.nature ?? '';
  const stock = product.stock ?? null;
  const bio = product.bio === 1 || product.bio === '1' || product.bio === true;
  const visible = product.visible === 1 || product.visible === '1' || product.visible === true;

  return (
    <article
      className="bg-white/90 backdrop-blur-sm border border-green-100 rounded-xl p-4 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {product.imageData ? (
            <img src={product.imageData} alt={name} className="h-16 w-16 rounded-md object-cover border flex-shrink-0" />
          ) : (
            <div className="h-16 w-16 rounded-md bg-neutral-50 border flex items-center justify-center text-sm text-neutral-400 flex-shrink-0">Image</div>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-green-800 truncate">{name}</h2>
            {nature && <p className="text-sm text-green-600 truncate">{nature}</p>}
          </div>
        </div>
        <div className="text-right">
          {price != null ? (
            <div className="inline-flex items-center gap-2">
              <span className="text-sm text-green-600">Prix</span>
              <span className="text-xl font-bold text-green-800">{price} €</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Prix non disponible</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {bio && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Bio</span>}
        {!visible && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Masqué</span>}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">Stock: <span className="font-medium text-gray-800">{stock ?? '—'}</span></p>
        {product.unitaireOuKilo === 1 || product.unitaireOuKilo === true ? (
          <button
            onClick={async () => {
              try {
                await onAdd(product, 1);
              } catch (err) {
                console.error('Failed to add product to shopping cart', err);
              }
            }}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
          >
            Ajouter
          </button>
        ) : (
          <KiloAdd product={product} onAdd={onAdd} />
        )}
      </div>
    </article>
  );
}

function KiloAdd({ product, onAdd }) {
  const [qty, setQty] = useState('0.1');
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0.1"
        step="0.1"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        className="w-20 border rounded px-2 py-1 text-sm"
      />
      <button
        onClick={async () => {
          const q = parseFloat(qty) || 0.1;
          try {
            await onAdd(product, q);
          } catch (err) {
            console.error('Failed to add product to shopping cart', err);
          }
        }}
        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
      >
        Ajouter
      </button>
    </div>
  );
}
