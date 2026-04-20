import { render } from '@testing-library/react';
import App from './App';

test('renders app root', () => {
  const { container } = render(<App />);

  expect(container.querySelector('.App')).toBeInTheDocument();
});
