import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import { PrimaryButton } from '../Button.jsx';
import IconButton from '../IconButton.jsx';
import AccountMenu from './AccountMenu.jsx';
import CartPreview from './CartPreview.jsx';
import HeaderPopover from './HeaderPopover.jsx';
import NavTabs from './NavTabs.jsx';
import NotificationsMenu from './NotificationsMenu.jsx';

const NAV_ICON_CLASS = 'text-secondary-500 hover:text-primary-600 hover:bg-primary-50';

function Header({
  cartCount = 0,
  cartItems = [],
  isAuthenticated = false,
  isProfessional = false,
  onSignOut = () => {},
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePopover, setActivePopover] = useState(null);
  const headerRef = useRef(null);

  const close = () => {
    setMenuOpen(false);
    setActivePopover(null);
  };

  const togglePopover = (name) => {
    setActivePopover((current) => (current === name ? null : name));
  };

  useEffect(() => {
    if (!activePopover && !menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (headerRef.current?.contains(event.target)) return;
      close();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePopover, menuOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-neutral-100/90 px-4 py-3 backdrop-blur-xl">
      {/* Main bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50/85 px-4 py-2.5 shadow-[0_18px_45px_rgba(29,52,34,.12)] backdrop-blur-md">

        {/* Left — logo + name */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 hover:opacity-80 transition"
        >
          <Logo className="h-5 w-auto text-primary-600 md:h-7" />
          <span className="text-sm font-bold text-primary-700 md:text-lg" style={{ fontFamily: 'var(--font-title)' }}>
            Local'zh
          </span>
        </button>

        {/* Right — desktop */}
        <div className="hidden md:flex items-center gap-3">
          <NavTabs isProfessional={isProfessional} />

          {/* Se connecter (non connecté uniquement) */}
          {!isAuthenticated && (
            <PrimaryButton onClick={() => navigate('/login')} className="h-9">
              Se connecter
            </PrimaryButton>
          )}

          {/* Icons — ordre : panier, notif, compte */}
          <div className="relative flex items-center gap-0.5">
            <IconButton icon="shopping_cart" label="Ouvrir le panier" badge={cartCount} onClick={() => togglePopover('cart')} className={NAV_ICON_CLASS} />
            <IconButton icon="notifications" label="Notifications" onClick={() => togglePopover('notifications')} className={NAV_ICON_CLASS} />
            <IconButton icon="person" label="Mon compte" onClick={() => togglePopover('account')} className={NAV_ICON_CLASS} />
            {activePopover === 'cart' ? (
              <HeaderPopover title="Votre panier">
                <CartPreview items={cartItems} onClose={close} />
              </HeaderPopover>
            ) : null}
            {activePopover === 'notifications' ? (
              <HeaderPopover title="Notifications">
                <NotificationsMenu isAuthenticated={isAuthenticated} />
              </HeaderPopover>
            ) : null}
            {activePopover === 'account' ? (
              <HeaderPopover title={isAuthenticated ? 'Mon espace' : 'Compte'}>
                <AccountMenu
                  isAuthenticated={isAuthenticated}
                  isProfessional={isProfessional}
                  onClose={close}
                  onSignOut={onSignOut}
                />
              </HeaderPopover>
            ) : null}
          </div>
        </div>

        {/* Right — mobile burger */}
        <IconButton
          icon={menuOpen ? 'close' : 'menu'}
          label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => {
            setMenuOpen(o => !o);
            setActivePopover(null);
          }}
          className={`md:hidden ${NAV_ICON_CLASS}`}
        />
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl border border-neutral-200 bg-neutral-50/95 px-4 py-3 shadow-lg backdrop-blur-md md:hidden">
          <NavTabs isProfessional={isProfessional} onNavigate={close} />

          {!isAuthenticated && (
            <PrimaryButton onClick={() => { navigate('/login'); close(); }} className="mt-1 w-full">
              Se connecter
            </PrimaryButton>
          )}

          <div className="flex items-center gap-1 pt-2 mt-1 border-t border-neutral-200">
            <IconButton icon="shopping_cart" label="Ouvrir le panier" badge={cartCount} onClick={() => togglePopover('cart')} className={NAV_ICON_CLASS} />
            <IconButton icon="notifications" label="Notifications" onClick={() => togglePopover('notifications')} className={NAV_ICON_CLASS} />
            <IconButton icon="person" label="Mon compte" onClick={() => togglePopover('account')} className={NAV_ICON_CLASS} />
          </div>

          {activePopover === 'cart' ? (
            <HeaderPopover title="Votre panier" mobile>
              <CartPreview items={cartItems} onClose={close} />
            </HeaderPopover>
          ) : null}
          {activePopover === 'notifications' ? (
            <HeaderPopover title="Notifications" mobile>
              <NotificationsMenu isAuthenticated={isAuthenticated} />
            </HeaderPopover>
          ) : null}
          {activePopover === 'account' ? (
            <HeaderPopover title={isAuthenticated ? 'Mon espace' : 'Compte'} mobile>
              <AccountMenu
                isAuthenticated={isAuthenticated}
                isProfessional={isProfessional}
                onClose={close}
                onSignOut={onSignOut}
              />
            </HeaderPopover>
          ) : null}
        </div>
      )}
    </header>
  );
}

export default Header;
