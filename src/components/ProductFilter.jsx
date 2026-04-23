import React from 'react';

export default function ProductFilter({ products = [], selectedNatures = [], onNatureChange = () => {} }) {
  const uniqueNatures = [...new Set(products.map(p => p.nature).filter(Boolean))].sort();

  const handleFilterChange = (nature) => {
    if (selectedNatures.includes(nature)) {
      onNatureChange(selectedNatures.filter(n => n !== nature));
    } else {
      onNatureChange([...selectedNatures, nature]);
    }
  };

  const handleSelectAll = () => {
    if (selectedNatures.length === uniqueNatures.length) {
      onNatureChange([]);
    } else {
      onNatureChange([...uniqueNatures]);
    }
  };

  if (uniqueNatures.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-green-100 rounded-xl p-6 shadow-sm mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-800">Filtrer par nature</h3>
          <button
            onClick={handleSelectAll}
            className="text-sm text-green-600 hover:text-green-800 underline transition"
          >
            {selectedNatures.length === uniqueNatures.length ? 'Réinitialiser' : 'Tous'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {uniqueNatures.map((nature) => {
            const isSelected = selectedNatures.includes(nature);
            const count = products.filter(p => p.nature === nature && (p.visible === 1 || p.visible === '1' || p.visible === true)).length;

            return (
              <button
                key={nature}
                onClick={() => handleFilterChange(nature)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isSelected
                    ? 'bg-green-600 text-white border border-green-600'
                    : 'bg-green-50 text-green-800 border border-green-200 hover:border-green-400'
                }`}
              >
                {nature}
                <span className="ml-1.5 text-xs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {selectedNatures.length > 0 && (
          <div className="text-sm text-gray-600">
            Filtres actifs: <span className="font-semibold text-green-700">{selectedNatures.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
