import React from 'react';
import SurfaceCard from './layout/SurfaceCard.jsx';
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
        <SurfaceCard className="col-span-full py-10 text-center text-neutral-600">Aucun produit trouvé.</SurfaceCard>
      )}
    </div>
  );
}
