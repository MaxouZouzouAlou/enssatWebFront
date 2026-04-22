import { useState, useMemo } from 'react';

export default function useCart(initial = []) {
  const [cartItems, setCartItems] = useState(initial);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product) => {
    setCartItems(prev => {
      const matchIndex = prev.findIndex(item => (item.product.idProduit && product.idProduit && item.product.idProduit === product.idProduit) || (item.product.id && product.id && item.product.id === product.id) || (item.product._id && product._id && item.product._id === product._id));
      if (matchIndex !== -1) {
        const copy = [...prev];
        copy[matchIndex] = { ...copy[matchIndex], quantity: copy[matchIndex].quantity + 1 };
        return copy;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => !(item.product.idProduit === productId || item.product.id === productId || item.product._id === productId)));
  };

  const updateQuantity = (productId, qty) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.idProduit === productId || item.product.id === productId || item.product._id === productId) {
        return { ...item, quantity: qty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // Count unique products (one per product), not total quantity
  const cartCount = useMemo(() => (cartItems ? cartItems.length : 0), [cartItems]);

  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);
  const toggleCart = () => setCartOpen(v => !v);

  return {
    cartItems,
    cartCount,
    cartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    openCart,
    closeCart,
    toggleCart,
  };
}
