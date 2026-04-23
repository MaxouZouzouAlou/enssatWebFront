import React from 'react';

export default function ProductSort({ sortOrder = 'none', onSortChange = () => {} }) {
  const sortOptions = [
    { value: 'none', label: 'Pas de tri' },
    { value: 'price-asc', label: 'Prix: moins cher au plus cher' },
    { value: 'price-desc', label: 'Prix: plus cher au moins cher' },
    { value: 'name-asc', label: 'Nom: A à Z' },
    { value: 'name-desc', label: 'Nom: Z à A' },
  ];

  return (
    <div className="flex items-center gap-3 mb-6">
      <label htmlFor="sort-select" className="text-sm font-semibold text-green-800">
        Trier par:
      </label>
      <select
        id="sort-select"
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-4 py-2 border border-green-200 rounded-lg text-sm bg-white text-green-800 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
