import { render } from '@testing-library/react';
import App from './App';

test('renders the legacy app shell', () => {
  const { container } = render(<App />);

  expect(container.firstChild).toHaveClass('App');
});
