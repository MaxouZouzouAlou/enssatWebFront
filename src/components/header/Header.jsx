import React from 'react';

function Header({ cartCount = 0, onAccountClick = () => {}, onCartClick = () => {} }) {
  return (
    <header className="w-full bg-gradient-to-r from-emerald-100 via-white to-emerald-100 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center bg-emerald-200 text-emerald-800 rounded-full shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 7 6 7 11C7 16 11 20 11 20" stroke="#065f46" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 2C12 2 17 6 17 11C17 16 13 20 13 20" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-800">Marché local</div>
            <div className="text-xs text-emerald-600">Produits frais et de saison</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAccountClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-200 rounded-md text-emerald-700 hover:bg-emerald-50 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.8954 19.1046 17 18 17H6C4.89543 17 4 17.8954 4 19V21" stroke="#065f46" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#065f46" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">Compte</span>
          </button>

          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H21L20 14H8L6 6Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L4 2H2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 20C9.55228 20 10 19.5523 10 19C10 18.4477 9.55228 18 9 18C8.44772 18 8 18.4477 8 19C8 19.5523 8.44772 20 9 20Z" fill="white" />
              <path d="M18 20C18.5523 20 19 19.5523 19 19C19 18.4477 18.5523 18 18 18C17.4477 18 17 18.4477 17 19C17 19.5523 17.4477 20 18 20Z" fill="white" />
            </svg>
            <span className="text-sm">Panier</span>
            <span className="sr-only">Articles dans le panier</span>

            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-emerald-800 bg-white rounded-full border border-emerald-200">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
