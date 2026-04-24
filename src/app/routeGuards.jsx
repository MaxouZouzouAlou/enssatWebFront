import { Navigate } from 'react-router';

const protectedPaths = new Set(['/compte', '/commandes', '/fidelite', '/dashboard-producteur', '/espace-pro', '/superadmin', '/tickets-incidents', '/commande/livraison', '/commande/paiement', '/commande/verification']);

export function getLogoutRedirectPath(pathname) {
	return protectedPaths.has(pathname) ? '/' : null;
}

export function LoadingPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-neutral-100 text-secondary-600">
			Chargement...
		</main>
	);
}

export function RequireGuest({ isAuthenticated, children }) {
	return isAuthenticated ? <Navigate to="/compte" replace /> : children;
}

export function RequireAuth({ isAuthenticated, children }) {
	return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function RequireProfessional({
	isAuthenticated,
	isProfessional,
	isProfileLoading,
	professionalId,
	children
}) {
	if (!isAuthenticated) return <Navigate to="/login" replace />;
	if (isProfileLoading) return <LoadingPage />;
	if (!isProfessional || !professionalId) return <Navigate to="/compte" replace />;
	return children;
}

export function RequireSuperAdmin({
	isAuthenticated,
	isProfileLoading,
	isSuperAdmin,
	children
}) {
	if (!isAuthenticated) return <Navigate to="/login" replace />;
	if (isProfileLoading) return <LoadingPage />;
	if (!isSuperAdmin) return <Navigate to="/compte" replace />;
	return children;
}
