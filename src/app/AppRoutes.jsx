import { useEffect, useMemo, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';
import PageTransition from '../components/PageTransition.jsx';
import Header from '../components/header/Header.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import useAuthProfile from '../features/auth/useAuthProfile';
import useCart from '../hooks/useCart';
import AccountPage from '../pages/AccountPage.jsx';
import CheckoutDeliveryPage from '../pages/CheckoutDeliveryPage.jsx';
import CheckoutPaymentPage from '../pages/CheckoutPaymentPage.jsx';
import CheckoutReviewPage from '../pages/CheckoutReviewPage.jsx';
import IncidentTicketsPage from '../pages/IncidentTicketsPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import LoyaltyPage from '../pages/LoyaltyPage.jsx';
import OrderDetailPage from '../pages/OrderDetailPage.jsx';
import OrderHistoryPage from '../pages/OrderHistoryPage.jsx';
import PanierPage from '../pages/PanierPage.jsx';
import ProfessionalDashboardPage from '../pages/ProfessionalDashboardPage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import ProductDetailPage from '../pages/ProductDetailPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ResetPasswordPage from '../pages/ResetPasswordPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import InteractiveMapPage from '../pages/InteractiveMapPage.jsx';
import { authClient } from '../services/auth-client';

const protectedPaths = new Set(['/compte', '/commandes', '/fidelite', '/dashboard-producteur', '/espace-pro', '/tickets-incidents', '/commande/livraison', '/commande/paiement', '/commande/verification']);


export function getLogoutRedirectPath(pathname) {
	return protectedPaths.has(pathname) ? '/' : null;
}

function MarketplaceLayout({
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

function AuthLayout() {
	return <Outlet />;
}

function LoadingPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-neutral-100 text-secondary-600">
			Chargement...
		</main>
	);
}

export default function AppRoutes() {
	const navigate = useNavigate();
	const location = useLocation();
	const { clearProfile, profileState, refreshSession, sessionState } = useAuthProfile();
	const profile = profileState.data?.profile;
	const { cartError, cartItems, cartCount, addToCart, clearCartError, removeFromCart, updateQuantity } = useCart(profile);

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
	const isProfessional = accountType === 'professionnel' || accountType === 'pro';
	const professionalId = profile?.professionnel?.id;
	const isProfileLoading = Boolean(profileState.loading);
	const professionalCompanies = useMemo(() => {
		if (!profile?.professionnel) return [];

		if (Array.isArray(profile.professionnel.entreprises) && profile.professionnel.entreprises.length > 0) {
			return profile.professionnel.entreprises;
		}

		if (profile.professionnel.entreprise) {
			return [profile.professionnel.entreprise];
		}

		return [];
	}, [profile]);
	const [selectedProfessionalCompanyId, setSelectedProfessionalCompanyId] = useState(null);

	useEffect(() => {
		if (!isProfessional || !professionalCompanies.length) {
			setSelectedProfessionalCompanyId(null);
			return;
		}

		const companyExists = professionalCompanies.some(
			(company) => String(company.id) === String(selectedProfessionalCompanyId)
		);

		if (!companyExists) {
			setSelectedProfessionalCompanyId(String(professionalCompanies[0].id));
		}
	}, [isProfessional, professionalCompanies, selectedProfessionalCompanyId]);

	const selectedProfessionalCompany = useMemo(() => {
		if (!professionalCompanies.length) return null;
		return (
			professionalCompanies.find((company) => String(company.id) === String(selectedProfessionalCompanyId)) ||
			professionalCompanies[0]
		);
	}, [professionalCompanies, selectedProfessionalCompanyId]);

	if (sessionState.isPending) return <LoadingPage />;

	const requireGuest = (element) => (
		isAuthenticated ? <Navigate to="/compte" replace /> : element
	);

	const requireAuth = (element) => (
		isAuthenticated ? element : <Navigate to="/login" replace />
	);

	const requireProfessional = (element) => {
		if (!isAuthenticated) return <Navigate to="/login" replace />;
		if (isProfileLoading) return <LoadingPage />;
		if (!isProfessional || !professionalId) return <Navigate to="/compte" replace />;
		return element;
	};

	return (
		<Routes>
			{/* Pages auth — sans header ni footer */}
			<Route element={<AuthLayout />}>
				<Route
					path="/login"
					element={requireGuest(<LoginPage onAuthenticated={refreshSessionAndOpenAccount} onSwitchToRegister={() => navigate('/register')} />)}
				/>
				<Route
					path="/register"
					element={requireGuest(<RegisterPage onSwitchToLogin={() => navigate('/login')} />)}
				/>
				<Route path="/reset-password" element={<ResetPasswordPage />} />
			</Route>

			{/* Reste de l'app — avec header et footer */}
			<Route element={
				<div className="min-h-screen bg-neutral-100">
					<Header
						cartCount={cartCount}
						cartItems={cartItems}
						isAuthenticated={isAuthenticated}
						isProfessional={isProfessional}
						removeFromCart={removeFromCart}
						onSignOut={signOut}
						updateQuantity={updateQuantity}
					/>
					<div>
						<PageTransition>
							<Outlet />
						</PageTransition>
					</div>
					<SiteFooter isAuthenticated={isAuthenticated} isProfessional={isProfessional} />
				</div>
			}>
				<Route path="/" element={<HomePage isAuthenticated={isAuthenticated} isProfessional={isProfessional} />} />
				<Route
					path="/dashboard-producteur"
					element={<Navigate to="/espace-pro" replace />}
				/>
				<Route
					path="/espace-pro"
					element={requireProfessional(
						<ProfessionalDashboardPage
							accountType={accountType}
							professionalId={professionalId}
							professionalCompanies={professionalCompanies}
							selectedCompany={selectedProfessionalCompany}
							onSelectCompany={setSelectedProfessionalCompanyId}
						/>
					)}
				/>
				<Route path="/tickets-incidents" element={requireAuth(<IncidentTicketsPage />)} />
				<Route path="/commandes" element={requireAuth(<OrderHistoryPage />)} />
				<Route path="/commandes/:idCommande" element={requireAuth(<OrderDetailPage />)} />
				<Route path="/fidelite" element={requireAuth(<LoyaltyPage />)} />
				<Route path="/carte-interactive" element={<InteractiveMapPage />} />
				<Route element={
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
				}>
					<Route path="/produits/:idProduit" element={<ProductDetailPage />} />
					<Route path="/achat" element={<Navigate to="/produits" replace />} />
					<Route path="/produits" element={<ProductsPage />} />
					<Route path="/panier" element={<PanierPage />} />
					<Route path="/commande/livraison" element={requireAuth(<CheckoutDeliveryPage />)} />
					<Route path="/commande/paiement" element={requireAuth(<CheckoutPaymentPage />)} />
					<Route path="/commande/verification" element={requireAuth(<CheckoutReviewPage />)} />
				</Route>
				<Route
					path="/compte"
					element={requireAuth(
							<AccountPage
								profile={profile}
								profileState={profileState}
								signOut={signOut}
								user={sessionState.data?.user}
								isProfessional={isProfessional}
								professionalCompanies={professionalCompanies}
								onProfileRefresh={refreshSession}
							/>
					)}
				/>
				<Route
					path="/parametres"
					element={requireAuth(
						<SettingsPage
							profile={profile}
							user={sessionState.data?.user}
							onSaved={refreshSession}
						/>
					)}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	);
}
