import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import App from './App';

it('renders the Wedding Overview & Dashboard once data loads', async () => {
  render(<App />);

  expect(await screen.findByRole('heading', { name: /Wedding Celebration/i })).toBeTruthy();
  expect(screen.getByText('Critical Tasks')).toBeTruthy();
  expect(screen.getByText('Family Planning Circle')).toBeTruthy();
});
