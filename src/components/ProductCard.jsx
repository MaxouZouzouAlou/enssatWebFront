import React from 'react';
import achatService from '../services/achatPage';
import { SurfaceCard } from './layout';

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
    <SurfaceCard interactive className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-primary-700">{name}</h2>
          {nature && <p className="text-sm text-primary-500">{nature}</p>}
        </div>
        <div className="text-right">
          {price != null ? (
            <div className="inline-flex items-center gap-2">
              <span className="text-sm text-primary-500">Prix</span>
              <span className="text-xl font-bold text-primary-700">{price} €</span>
            </div>
          ) : (
            <span className="text-sm text-neutral-500">Prix non disponible</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {bio && <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">Bio</span>}
        {!visible && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Masqué</span>}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          Stock : <span className="font-medium text-secondary-700">{stock ?? '—'}</span>
        </p>
        <button
          onClick={async () => {
            try {
              await achatService.addProductToShoppingCart(id);
            } catch (err) {
              console.error('Failed to add product to shopping cart', err);
            }
            onAdd(product);
          }}
          className="rounded-xl bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Ajouter
        </button>
      </div>
    </SurfaceCard>
  );
}
