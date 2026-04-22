import { getLogoutRedirectPath } from './AppRoutes.jsx';

jest.mock('../services/auth-client', () => ({
  authClient: {
    useSession: () => ({
      data: null,
      isPending: false,
      refetch: jest.fn()
    }),
    signOut: jest.fn()
  },
  fetchAuthProfile: jest.fn()
}));


test('redirects logout from protected pages to home', () => {
  expect(getLogoutRedirectPath('/compte')).toBe('/');
  expect(getLogoutRedirectPath('/dashboard-producteur')).toBe('/');
  expect(getLogoutRedirectPath('/espace-pro')).toBe('/');
  expect(getLogoutRedirectPath('/tickets-incidents')).toBe('/');
  expect(getLogoutRedirectPath('/produits')).toBeNull();
  expect(getLogoutRedirectPath('/')).toBeNull();
});
