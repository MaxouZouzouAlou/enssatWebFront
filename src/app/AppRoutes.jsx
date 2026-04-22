import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';
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
import PanierPage from '../pages/PanierPage.jsx';
import ProfessionalDashboardPage from '../pages/ProfessionalDashboardPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import { authClient } from '../services/auth-client';

function MarketplaceLayout({ addToCart, cartItems }) {
	return <Outlet context={{ addToCart, cartItems }} />;
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
	const { clearProfile, profileState, refreshSession, sessionState } = useAuthProfile();
	const { cartItems, cartCount, addToCart } = useCart();

	const refreshSessionAndOpenAccount = async () => {
		await refreshSession();
		navigate('/compte', { replace: true });
	};

	const signOut = async () => {
		await authClient.signOut();
		clearProfile();
		await sessionState.refetch?.();
		navigate('/login');
	};

	if (sessionState.isPending) return <LoadingPage />;

	const profile = profileState.data?.profile;
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
						onSignOut={signOut}
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
					element={requireProfessional(<ProfessionalDashboardPage accountType={accountType} professionalId={professionalId} />)}
				/>
				<Route path="/tickets-incidents" element={requireAuth(<IncidentTicketsPage />)} />
				<Route element={<MarketplaceLayout addToCart={addToCart} cartItems={cartItems} />}>
					<Route path="/achat" element={<AchatPage />} />
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
