import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';
import PageTransition from '../components/PageTransition.jsx';
import Header from '../components/header/Header.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import useAuthProfile from '../features/auth/useAuthProfile';
import useCart from '../hooks/useCart';
import AccountPage from '../pages/AccountPage.jsx';
import AchatPage from '../pages/AchatPage.jsx';
import IncidentTicketsPage from '../pages/IncidentTicketsPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import LoyaltyPage from '../pages/LoyaltyPage.jsx';
import PanierPage from '../pages/PanierPage.jsx';
import ProfessionalDashboardPage from '../pages/ProfessionalDashboardPage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import { authClient } from '../services/auth-client';

const protectedPaths = new Set(['/compte', '/fidelite', '/dashboard-producteur', '/espace-pro', '/tickets-incidents']);

export function getLogoutRedirectPath(pathname) {
	return protectedPaths.has(pathname) ? '/' : null;
}

function MarketplaceLayout({ addToCart, cartError, cartItems, clearCartError, removeFromCart, updateQuantity, profile, isAuthenticated, accountType }) {
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

	if (sessionState.isPending) return <LoadingPage />;

	const accountType = profile?.accountType || sessionState.data?.user?.accountType || 'particulier';
	const isAuthenticated = Boolean(sessionState.data);
	const isProfessional = accountType === 'professionnel' || accountType === 'pro';
	const professionalId = profile?.professionnel?.id;
	const isProfileLoading = Boolean(profileState.loading);

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
					element={requireProfessional(<ProfessionalDashboardPage accountType={accountType} professionalId={professionalId} />)}
				/>
				<Route path="/tickets-incidents" element={requireAuth(<IncidentTicketsPage />)} />
				<Route path="/fidelite" element={requireAuth(<LoyaltyPage />)} />
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
					<Route path="/achat" element={<AchatPage />} />
					<Route path="/produits" element={<ProductsPage />} />
					<Route path="/panier" element={<PanierPage />} />
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
							/>
					)}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	);
}
