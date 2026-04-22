import React from 'react';
import '../styles/App.css';
import Header from '../components/header/Header';
import Achat from '../pages/Achat';
import Panier from '../pages/Panier';
import Cart from '../components/header/Cart';
import useCart from '../hooks/useCart';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
	const {
		cartItems,
		cartCount,
		cartOpen,
		addToCart,
		removeFromCart,
		updateQuantity,
		openCart,
		closeCart,
	} = useCart();

	return (
		<div className="App">
			<Router>
				<Header cartCount={cartCount} onCartClick={openCart} />

				<Routes>
					<Route path="/" element={<Achat addToCart={addToCart} />} />
					<Route path="/panier" element={<Panier items={cartItems} />} />
				</Routes>

				{cartOpen && (
					<Cart
						items={cartItems}
						onClose={closeCart}
						removeItem={removeFromCart}
						updateQuantity={updateQuantity}
					/>
				)}
			</Router>
		</div>
	);
}

export default App;
