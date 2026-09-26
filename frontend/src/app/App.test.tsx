import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import App from './App';

it('renders the application shell', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'Band Baaja Baaraat' })).toBeTruthy();
});
