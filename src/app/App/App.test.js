import { getLogoutRedirectPath } from '../routeGuards.jsx';

jest.mock('../../services/auth-client', () => ({
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

jest.mock('../../pages/InteractiveMapPage/InteractiveMapPage.jsx', () => () => null);
jest.mock('../../pages/CheckoutDeliveryPage.jsx', () => () => null);
jest.mock('../../pages/OrderDetailPage.jsx', () => () => null);


test('redirects logout from protected pages to home', () => {
  expect(getLogoutRedirectPath('/compte')).toBe('/');
  expect(getLogoutRedirectPath('/dashboard-producteur')).toBe('/');
  expect(getLogoutRedirectPath('/espace-pro')).toBe('/');
  expect(getLogoutRedirectPath('/superadmin')).toBe('/');
  expect(getLogoutRedirectPath('/tickets-incidents')).toBe('/');
  expect(getLogoutRedirectPath('/produits')).toBeNull();
  expect(getLogoutRedirectPath('/')).toBeNull();
});
