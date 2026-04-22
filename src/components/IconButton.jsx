import React from 'react';

export default function IconButton({ active = false, icon, label, badge, onClick, className = '' }) {
  return (
    <button
      aria-pressed={active}
      onClick={onClick}
      aria-label={label}
      type="button"
      className={`relative w-10 h-10 flex items-center justify-center rounded-full transition ${className}`}
    >
      <span className="material-symbols-rounded" style={{ fontSize: '1.65rem', lineHeight: 1 }}>{icon}</span>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-primary-600 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
