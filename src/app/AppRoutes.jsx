import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import useAuthProfile from '../features/auth/useAuthProfile';
import useSelectedProfessionalCompany from '../features/dashboard/useSelectedProfessionalCompany/useSelectedProfessionalCompany';
import useCart from '../hooks/useCart/useCart';
import useNotifications from '../hooks/useNotifications';
import AccountPage from '../pages/AccountPage/AccountPage.jsx';
import CheckoutDeliveryPage from '../pages/CheckoutDeliveryPage.jsx';
import CheckoutPaymentPage from '../pages/CheckoutPaymentPage.jsx';
import CheckoutReviewPage from '../pages/CheckoutReviewPage.jsx';
import IncidentTicketsPage from '../pages/IncidentTicketsPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import LegalMentionsPage from '../pages/LegalMentionsPage.jsx';
import LoyaltyPage from '../pages/LoyaltyPage/LoyaltyPage.jsx';
import OrderDetailPage from '../pages/OrderDetailPage.jsx';
import OrderHistoryPage from '../pages/OrderHistoryPage.jsx';
import PanierPage from '../pages/PanierPage.jsx';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage.jsx';
import ProfessionalDashboardPage from '../pages/ProfessionalDashboardPage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import ProductDetailPage from '../pages/ProductDetailPage.jsx';
import ProducerPage from '../pages/ProducerPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ResetPasswordPage from '../pages/ResetPasswordPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import SuperAdminPage from '../pages/SuperAdminPage/SuperAdminPage.jsx';
import TermsOfUsePage from '../pages/TermsOfUsePage.jsx';
import InteractiveMapPage from '../pages/InteractiveMapPage/InteractiveMapPage.jsx';
import { authClient } from '../services/auth-client';
import { AppShell, AuthLayout, MarketplaceLayout } from './AppLayouts.jsx';
import { getLogoutRedirectPath, LoadingPage, RequireAuth, RequireGuest, RequireProfessional, RequireSuperAdmin } from './routeGuards.jsx';
import { useToast } from './ToastProvider.jsx';

export default function AppRoutes() {
	const navigate = useNavigate();
	const location = useLocation();
	const toast = useToast();
	const { clearProfile, profileState, refreshSession, sessionState } = useAuthProfile();
	const profile = profileState.data?.profile;
	const { cartError, cartItems, cartCount, addToCart, clearCartError, removeFromCart, updateQuantity } = useCart(profile, undefined, {
		showError: toast.showError,
		showInfo: toast.showInfo,
		showSuccess: toast.showSuccess
	});

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location.pathname]);

	const refreshSessionAndOpenAccount = async () => {
		await refreshSession();
		navigate('/compte', { replace: true });
	};

	const signOut = async () => {
		await authClient.signOut();
		clearProfile();
		const redirectPath = getLogoutRedirectPath(location.pathname);
		if (redirectPath) {
			navigate(redirectPath, { replace: true });
		}
		await sessionState.refetch?.();
	};

	const accountType = profile?.accountType || sessionState.data?.user?.accountType || 'particulier';
	const isAuthenticated = Boolean(sessionState.data);
	const { notifications, unreadCount, markRead, markAllRead, deleteNotif } = useNotifications(isAuthenticated);
	const isProfessional = accountType === 'professionnel' || accountType === 'pro';
	const isSuperAdmin = accountType === 'superadmin';
	const professionalId = profile?.professionnel?.id;
	const isProfileLoading = Boolean(profileState.loading);
	const {
		professionalCompanies,
		selectedProfessionalCompany,
		setSelectedProfessionalCompanyId
	} = useSelectedProfessionalCompany({
		isProfessional,
		profile
	});

	if (sessionState.isPending) return <LoadingPage />;

		return (
			<Routes>
				{/* Pages auth — sans header ni footer */}
				<Route element={<AuthLayout />}>
					<Route
						path="/login"
						element={(
							<RequireGuest isAuthenticated={isAuthenticated}>
								<LoginPage onAuthenticated={refreshSessionAndOpenAccount} onSwitchToRegister={() => navigate('/register')} />
							</RequireGuest>
						)}
					/>
					<Route
						path="/register"
						element={(
							<RequireGuest isAuthenticated={isAuthenticated}>
								<RegisterPage onSwitchToLogin={() => navigate('/login')} />
							</RequireGuest>
						)}
					/>
					<Route path="/reset-password" element={<ResetPasswordPage />} />
				</Route>

				{/* Reste de l'app — avec header et footer */}
				<Route
					element={(
						<AppShell
							cartCount={cartCount}
							cartItems={cartItems}
							isAuthenticated={isAuthenticated}
							isProfessional={isProfessional}
							isSuperAdmin={isSuperAdmin}
							notifications={notifications}
							notificationCount={unreadCount}
							onMarkNotificationRead={markRead}
							onMarkAllNotificationsRead={markAllRead}
							onDeleteNotification={deleteNotif}
							removeFromCart={removeFromCart}
							onSignOut={signOut}
							updateQuantity={updateQuantity}
						/>
					)}
				>
					<Route path="/" element={<HomePage isAuthenticated={isAuthenticated} isProfessional={isProfessional} />} />
					<Route
						path="/dashboard-producteur"
						element={<Navigate to="/espace-pro" replace />}
					/>
					<Route
						path="/espace-pro"
						element={(
							<RequireProfessional
								isAuthenticated={isAuthenticated}
								isProfessional={isProfessional}
								isProfileLoading={isProfileLoading}
								professionalId={professionalId}
							>
								<ProfessionalDashboardPage
									accountType={accountType}
									professionalId={professionalId}
									professionalCompanies={professionalCompanies}
									selectedCompany={selectedProfessionalCompany}
									onSelectCompany={setSelectedProfessionalCompanyId}
								/>
							</RequireProfessional>
						)}
					/>
					<Route path="/tickets-incidents" element={<RequireAuth isAuthenticated={isAuthenticated}><IncidentTicketsPage /></RequireAuth>} />
					<Route path="/commandes" element={<RequireAuth isAuthenticated={isAuthenticated}><OrderHistoryPage /></RequireAuth>} />
					<Route path="/commandes/:idCommande" element={<RequireAuth isAuthenticated={isAuthenticated}><OrderDetailPage /></RequireAuth>} />
					<Route path="/fidelite" element={<RequireAuth isAuthenticated={isAuthenticated}><LoyaltyPage /></RequireAuth>} />
					<Route
						path="/superadmin"
						element={(
							<RequireSuperAdmin
								isAuthenticated={isAuthenticated}
								isProfileLoading={isProfileLoading}
								isSuperAdmin={isSuperAdmin}
							>
								<SuperAdminPage />
							</RequireSuperAdmin>
						)}
					/>
					<Route path="/carte-interactive" element={<InteractiveMapPage />} />
					<Route path="/producteurs/:idProfessionnel" element={<ProducerPage isAuthenticated={isAuthenticated} accountType={accountType} />} />
					<Route path="/mentions-legales" element={<LegalMentionsPage />} />
					<Route path="/confidentialite" element={<PrivacyPolicyPage />} />
					<Route path="/conditions-utilisation" element={<TermsOfUsePage />} />
					<Route
						element={(
							<MarketplaceLayout
								addToCart={addToCart}
								cartError={cartError}
								cartItems={cartItems}
								clearCartError={clearCartError}
								removeFromCart={removeFromCart}
								updateQuantity={updateQuantity}
								profile={profile}
								isAuthenticated={isAuthenticated}
								accountType={accountType}
							/>
						)}
					>
						<Route path="/produits/:idProduit" element={<ProductDetailPage />} />
						<Route path="/achat" element={<Navigate to="/produits" replace />} />
						<Route path="/produits" element={<ProductsPage />} />
						<Route path="/panier" element={<PanierPage />} />
						<Route path="/commande/livraison" element={<RequireAuth isAuthenticated={isAuthenticated}><CheckoutDeliveryPage /></RequireAuth>} />
						<Route path="/commande/paiement" element={<RequireAuth isAuthenticated={isAuthenticated}><CheckoutPaymentPage /></RequireAuth>} />
						<Route path="/commande/verification" element={<RequireAuth isAuthenticated={isAuthenticated}><CheckoutReviewPage /></RequireAuth>} />
					</Route>
					<Route
						path="/compte"
						element={(
							<RequireAuth isAuthenticated={isAuthenticated}>
								<AccountPage
									profile={profile}
									profileState={profileState}
									signOut={signOut}
									user={sessionState.data?.user}
									isProfessional={isProfessional}
									professionalCompanies={professionalCompanies}
									onSelectProfessionalCompany={setSelectedProfessionalCompanyId}
									onProfileRefresh={refreshSession}
								/>
							</RequireAuth>
						)}
					/>
					<Route
						path="/parametres"
						element={(
							<RequireAuth isAuthenticated={isAuthenticated}>
								<SettingsPage
									profile={profile}
									user={sessionState.data?.user}
									onSaved={refreshSession}
								/>
							</RequireAuth>
						)}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Route>
			</Routes>
	);
}
