import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products = [], addToCart = () => {} }) {
  const visibleProducts = products.filter(
    (p) => !(p.visible === 0 || p.visible === '0' || p.visible === false)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {visibleProducts.length ? (
        visibleProducts.map((p, idx) => (
          <ProductCard key={p.idProduit ?? p.id ?? p._id ?? idx} product={p} onAdd={addToCart} />
        ))
      ) : (
        <div className="col-span-full rounded-2xl bg-neutral-50 py-10 text-center text-neutral-600 shadow-[0_16px_40px_rgba(29,52,34,.10)]">Aucun produit trouvé.</div>
      )}
    </div>
  );
}
