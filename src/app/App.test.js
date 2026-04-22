import { render } from '@testing-library/react';
import App from './App.jsx';

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

test('renders app root', () => {
  const { getByText } = render(<App />);

  expect(getByText('Marketplace locale en Bretagne')).toBeInTheDocument();
});
