import React from 'react';
import shoppingCart from '../services/shoppingCart';

export default function ProductCard({ product, onAdd = () => {} }) {
  const id = product.idProduit ?? product.id ?? product._id;
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
        <div>
          <h2 className="text-lg font-semibold text-green-800">{name}</h2>
          {nature && <p className="text-sm text-green-600">{nature}</p>}
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
        <button
          onClick={async () => {
            const id = product.idProduit ?? product.id ?? product._id;
            try {
              await shoppingCart.addProductToShoppingCart(id);
            } catch (err) {
              console.error('Failed to add product to shopping cart', err);
            }
            onAdd(product);
          }}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
        >
          Ajouter
        </button>
      </div>
    </article>
  );
}
