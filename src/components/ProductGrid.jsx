import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products = [], addToCart = () => {}, onOpenProduct = () => {} }) {
  const visibleProducts = (products || []).filter(
    (p) => !(p.visible === 0 || p.visible === '0' || p.visible === false)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {visibleProducts && visibleProducts.length ? (
        visibleProducts.map((p, idx) => (
          <ProductCard
            key={p.idProduit ?? p.id ?? p._id ?? idx}
            product={p}
            onAdd={addToCart}
            onOpenProduct={onOpenProduct}
          />
        ))
      ) : (
        <p className="col-span-full text-center text-secondary-500 py-12">Aucun produit disponible.</p>
      )}
    </div>
  );
}
