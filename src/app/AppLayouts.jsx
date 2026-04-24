import { Outlet } from 'react-router';
import PageTransition from '../components/PageTransition.jsx';
import Header from '../components/header/Header.jsx';
import SiteFooter from '../components/SiteFooter.jsx';

export function AppShell({
	cartCount,
	cartItems,
	isAuthenticated,
	isProfessional,
	isSuperAdmin,
	notifications,
	notificationCount,
	onMarkNotificationRead,
	onMarkAllNotificationsRead,
	onDeleteNotification,
	removeFromCart,
	onSignOut,
	updateQuantity
}) {
	return (
		<div className="min-h-screen bg-neutral-100">
			<Header
				cartCount={cartCount}
				cartItems={cartItems}
				isAuthenticated={isAuthenticated}
				isProfessional={isProfessional}
				isSuperAdmin={isSuperAdmin}
				notifications={notifications}
				notificationCount={notificationCount}
				onMarkNotificationRead={onMarkNotificationRead}
				onMarkAllNotificationsRead={onMarkAllNotificationsRead}
				onDeleteNotification={onDeleteNotification}
				removeFromCart={removeFromCart}
				onSignOut={onSignOut}
				updateQuantity={updateQuantity}
			/>
			<div>
				<PageTransition>
					<Outlet />
				</PageTransition>
			</div>
			<SiteFooter isAuthenticated={isAuthenticated} isProfessional={isProfessional} />
		</div>
	);
}

export function MarketplaceLayout({
	addToCart,
	cartError,
	cartItems,
	clearCartError,
	removeFromCart,
	updateQuantity,
	profile,
	isAuthenticated,
	accountType
}) {
	return <Outlet context={{ addToCart, cartError, cartItems, clearCartError, removeFromCart, updateQuantity, profile, isAuthenticated, accountType }} />;
}

export function AuthLayout() {
	return <Outlet />;
}
