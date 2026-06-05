import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(null)),
}));

const createFetchResponse = (data, ok = true) =>
  Promise.resolve({
    ok,
    json: async () => data,
  });

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.history.pushState({}, '', '/');
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/health')) {
      return createFetchResponse({ status: 'ok' });
    }
    if (url.includes('/api/auth/me')) {
      return createFetchResponse({ email: '', rank_score: 1, rank_title: 'bolshevik' });
    }
    if (url.includes('/api/profile')) {
      return createFetchResponse({
        email: 'comrade@example.com',
        rank_score: 1,
        rank_title: 'bolshevik',
        avatar: null,
        perspective: {},
        socialLinks: { instagram: '', tiktok: '', facebook: '' },
      });
    }
    return createFetchResponse({});
  });
});

test('renders The Majorities app without crashing', () => {
  render(<App />);
  expect(screen.getAllByText(/The Majorities/i).length).toBeGreaterThan(0);
});

test('renders navigation with Home link', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
});

test('renders product selection rows on home page', () => {
  render(<App />);
  expect(screen.getAllByText(/Pick Shampoo/i).length).toBeGreaterThan(0);
});

test('shows dynamic one-time and subscription totals for a full custom set', () => {
  render(<App />);

  [
    'The Majorities Shampoo',
    'The Majorities Conditioner',
    'The Majorities Hair Oil',
    'The Majorities Facial Scrub',
    'The Majorities Face Toner',
    'The Majorities Moisturizing Lotion',
  ].forEach((productName) => {
    fireEvent.click(screen.getByText(productName));
  });

  expect(screen.getByText('1 time Checkout ($36.00)')).toBeInTheDocument();
  expect(screen.getByText('Monthly Subscription Checkout ($30.00 / month)')).toBeInTheDocument();
  expect(screen.getByText(/You save/)).toHaveTextContent('$6.00');
});

test('renders backend-synced rank progress on the profile page', async () => {
  localStorage.setItem('authToken', 'test-token');
  localStorage.setItem('userEmail', 'domovoi@example.com');
  window.history.pushState({}, '', '/profile');

  global.fetch = jest.fn((url) => {
    if (url.includes('/api/health')) {
      return createFetchResponse({ status: 'ok' });
    }
    if (url.includes('/api/auth/me')) {
      return createFetchResponse({ email: 'domovoi@example.com', rank_score: 1500, rank_title: 'bolshevik' });
    }
    if (url.includes('/api/profile')) {
      return createFetchResponse({
        email: 'domovoi@example.com',
        rank_score: 1500,
        rank_title: 'bolshevik',
        avatar: null,
        perspective: {},
        socialLinks: { instagram: '', tiktok: '', facebook: '' },
      });
    }
    return createFetchResponse({});
  });

  render(<App />);

  expect(await screen.findByText(/Domovoi/i)).toBeInTheDocument();
  expect(await screen.findByText('1,500 points')).toBeInTheDocument();
  expect(screen.getByRole('progressbar', { name: /rank progress/i })).toHaveAttribute('aria-valuenow', '1500');
});
