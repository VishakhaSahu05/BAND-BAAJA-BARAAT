import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import * as dashboardApi from '../features/dashboard/api/dashboardApi';
import * as authApi from '../services/authApi';
import { ApiClientError } from '../services/apiClient';
import * as weddingsApi from '../services/weddingsApi';
import App from './App';

beforeEach(() => {
  window.history.pushState({}, '', '/');
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('renders the Wedding Overview & Dashboard for an authenticated user with a wedding', async () => {
  vi.spyOn(authApi, 'getCurrentUser').mockResolvedValue({
    id: 'user-1',
    name: 'Ananya Sharma',
    email: 'ananya@example.com',
    createdAt: new Date().toISOString(),
  });
  vi.spyOn(weddingsApi, 'getCurrentWedding').mockResolvedValue({
    id: 'wedding-1',
    brideName: 'Ananya',
    groomName: 'Kabir',
    weddingDate: new Date().toISOString(),
    timeZone: 'Asia/Kolkata',
    isItineraryPrivate: true,
    location: { formattedAddress: 'Jaipur', city: 'Jaipur', state: 'Rajasthan', country: 'India' },
    websiteSlug: 'ananya-kabir',
    createdAt: new Date().toISOString(),
  });
  const getDashboardData = vi.spyOn(dashboardApi, 'getDashboardData').mockResolvedValue({
    wedding: {
      coupleName: 'Ananya & Kabir',
      eventLabel: 'Wedding Celebration',
      venueLine: 'Jaipur, Rajasthan',
      scheduleLine: '3 Auspicious Days • 4 Ceremonies',
      description: '',
    },
    countdown: { targetDateIso: new Date(Date.now() + 86_400_000).toISOString() },
    metrics: [
      {
        id: 'ritual-milestones',
        label: 'Ritual Milestones',
        value: '0 of 4',
        valueSuffix: 'Ceremonies Set',
        badgeText: 'In Progress',
        accent: 'secondary',
        progressPercent: 0,
      },
    ],
    ceremonies: [],
    criticalTasks: [],
    familyCircle: [],
    venue: { name: 'Jaipur', detailLine: 'Rajasthan, India' },
    quote: { text: 'quote', attribution: 'Shubh Vivaah' },
  });

  render(<App />);

  expect(await screen.findByRole('heading', { name: /Ananya & Kabir's Wedding Celebration/i })).toBeTruthy();
  expect(getDashboardData).toHaveBeenCalledWith('wedding-1');
  expect(screen.getByText('0 of 4')).toBeTruthy();
  expect(screen.getByText('Muhurat not set yet')).toBeTruthy();
  expect(screen.getByText('Venue contact not added yet')).toBeTruthy();
  expect(screen.getByText('Critical Tasks')).toBeTruthy();
  expect(screen.getByText('Family Planning Circle')).toBeTruthy();
});

it('redirects an unauthenticated user to the login page', async () => {
  vi.spyOn(authApi, 'getCurrentUser').mockRejectedValue(new Error('Unauthenticated'));

  render(<App />);

  expect(await screen.findByRole('heading', { name: /Band Baaja Baaraat/i })).toBeTruthy();
  expect(screen.getByText(/Sign in to access your wedding planning portal/i)).toBeTruthy();
});

it('redirects an authenticated user with no wedding yet to onboarding', async () => {
  vi.spyOn(authApi, 'getCurrentUser').mockResolvedValue({
    id: 'user-1',
    name: 'Ananya Sharma',
    email: 'ananya@example.com',
    createdAt: new Date().toISOString(),
  });
  vi.spyOn(weddingsApi, 'getCurrentWedding').mockRejectedValue(
    new ApiClientError(404, { code: 'NOT_FOUND', message: 'No wedding is set up for this account yet.', details: [] }),
  );

  render(<App />);

  expect(await screen.findByRole('heading', { name: /Let.s set up your celebration/i })).toBeTruthy();
});
