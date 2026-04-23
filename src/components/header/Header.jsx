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

const NAV_ICON_CLASS = 'text-secondary-500 hover:bg-primary-100 hover:text-primary-800';
const ACTIVE_NAV_ICON_CLASS = 'bg-primary-100 text-primary-800';

function Header({
  cartCount = 0,
  cartItems = [],
  isAuthenticated = false,
  isProfessional = false,
  isSuperAdmin = false,
  notifications = [],
  notificationCount = 0,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onDeleteNotification,
  removeFromCart = () => {},
  onSignOut = () => {},
  updateQuantity = () => {},
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

  const getActionIconClass = (name) => `${NAV_ICON_CLASS} ${activePopover === name ? ACTIVE_NAV_ICON_CLASS : ''}`;

  const renderActionContent = (name, mobile = false) => {
    if (name === 'cart') {
      return (
        <HeaderPopover title="Votre panier" mobile={mobile}>
          <CartPreview
            items={cartItems}
            onClose={close}
            removeItem={removeFromCart}
            updateQuantity={updateQuantity}
          />
        </HeaderPopover>
      );
    }

    if (name === 'notifications') {
      return (
        <HeaderPopover title="Notifications" mobile={mobile}>
          <NotificationsMenu
            isAuthenticated={isAuthenticated}
            notifications={notifications}
            onMarkRead={onMarkNotificationRead}
            onMarkAllRead={onMarkAllNotificationsRead}
            onDelete={onDeleteNotification}
            onClose={close}
          />
        </HeaderPopover>
      );
    }

    if (name === 'account') {
      return (
        <HeaderPopover title={isAuthenticated ? 'Mon espace' : 'Compte'} mobile={mobile}>
          <AccountMenu
            isAuthenticated={isAuthenticated}
            isProfessional={isProfessional}
            isSuperAdmin={isSuperAdmin}
            onClose={close}
            onSignOut={onSignOut}
          />
        </HeaderPopover>
      );
    }

    return null;
  };

  const renderHeaderActions = ({ mobile = false } = {}) => (
    <>
      {mobile && (
        <IconButton
          active={activePopover === null}
          icon="apps"
          label="Menu"
          onClick={() => setActivePopover(null)}
          className={`${NAV_ICON_CLASS} ${activePopover === null ? ACTIVE_NAV_ICON_CLASS : ''}`}
        />
      )}
      <IconButton
        active={activePopover === 'cart'}
        icon="shopping_cart"
        label="Ouvrir le panier"
        badge={cartCount}
        onClick={() => togglePopover('cart')}
        className={getActionIconClass('cart')}
      />
      <IconButton
        active={activePopover === 'notifications'}
        icon="notifications"
        label="Notifications"
        badge={notificationCount}
        onClick={() => togglePopover('notifications')}
        className={getActionIconClass('notifications')}
      />
      <IconButton
        active={activePopover === 'account'}
        icon="person"
        label="Mon compte"
        onClick={() => togglePopover('account')}
        className={getActionIconClass('account')}
      />
    </>
  );

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
    <header ref={headerRef} className="sticky top-0 z-40 px-4 py-3">
      {/* Main bar */}
      <div className="mx-auto flex w-[min(1280px,calc(100%-2rem))] items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50/85 px-4 py-2.5 shadow-[0_18px_45px_rgba(29,52,34,.12)] backdrop-blur-md">

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
            {renderHeaderActions({ mobile: false })}
            {activePopover ? renderActionContent(activePopover) : null}
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
        <div className="mx-auto mt-3 flex w-[min(1280px,calc(100%-2rem))] flex-col rounded-2xl border border-neutral-200 bg-neutral-50/95 px-4 py-3 shadow-[0_24px_70px_rgba(29,52,34,.18)] backdrop-blur-md md:hidden">
          <div className="flex items-center justify-end gap-1">
            {renderHeaderActions({ mobile: true })}
          </div>

          <div key={activePopover || 'navigation'} className="animate-header-popover pt-3">
            {activePopover ? (
              renderActionContent(activePopover, true)
            ) : (
              <div className="flex flex-col items-center gap-3 border-t border-neutral-200 pt-3">
                <NavTabs className="justify-center" isProfessional={isProfessional} onNavigate={() => setActivePopover(null)} />
                {!isAuthenticated ? (
                  <PrimaryButton onClick={() => { navigate('/login'); setActivePopover(null); }} className="w-full">
                    Se connecter
                  </PrimaryButton>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
