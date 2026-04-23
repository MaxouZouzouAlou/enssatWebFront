import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products = [], addToCart = () => {}, onOpenReviews = () => {} }) {
  const visibleProducts = (products || []).filter(
    (p) => !(p.visible === 0 || p.visible === '0' || p.visible === false)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {visibleProducts && visibleProducts.length ? (
        visibleProducts.map((p, idx) => (
          <ProductCard key={p.idProduit ?? p.id ?? p._id ?? idx} product={p} onAdd={addToCart} onOpenReviews={onOpenReviews} />
        ))
      ) : (
        <div className="col-span-full text-center text-gray-600 py-8">Aucun produit trouvé.</div>
      )}
    </div>
  );
}
