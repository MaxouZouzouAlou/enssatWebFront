import { useLocation, useNavigate } from 'react-router';

export default function NavTabs({ className = '', isProfessional = false, onNavigate }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { label: 'Nos produits', path: '/produits' },
    ...(isProfessional ? [{ label: 'Espace pro', path: '/espace-pro' }] : []),
  ];

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const handleClick = (path) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <nav className={`flex items-center gap-1 ${className}`}>
      {tabs.map(({ label, path }) => (
        <button
          key={path}
          onClick={() => handleClick(path)}
          className={`relative px-3 py-2 text-sm font-medium rounded-lg transition ${
            isActive(path)
              ? 'text-primary-700'
              : 'text-secondary-600 hover:text-primary-700 hover:bg-neutral-200'
          }`}
        >
          {label}
          <span
            className={`absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-primary-500 transition-opacity ${
              isActive(path) ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
