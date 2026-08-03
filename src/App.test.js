import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(null)),
}));

beforeEach(() => {
  window.history.pushState({}, '', '/');
  window.localStorage.clear();
  window.sessionStorage.clear();
  global.fetch = jest.fn((url) =>
    Promise.resolve({
      ok: true,
      json: async () => (String(url).includes('/api/auth/me') ? {} : []),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
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

test('does not show ad monetization on the home page', () => {
  render(<App />);
  expect(screen.queryByText(/Sponsored Discovery/i)).not.toBeInTheDocument();
});

test('shows ad monetization on the duma page', () => {
  window.history.pushState({}, '', '/duma');
  render(<App />);
  expect(screen.getByText(/Sponsored Discovery/i)).toBeInTheDocument();
});

test('shows ad monetization on the culture page', async () => {
  window.localStorage.setItem('authToken', 'token');
  window.localStorage.setItem('userEmail', 'member@example.com');
  global.fetch = jest.fn((url) =>
    Promise.resolve({
      ok: true,
      json: async () => (String(url).includes('/api/auth/me') ? { email: 'member@example.com', rank_score: 1 } : []),
    })
  );

  window.history.pushState({}, '', '/culture');
  render(<App />);

  expect(await screen.findByText(/Share Your Perspective/i)).toBeInTheDocument();
  expect(screen.getByText(/Sponsored Discovery/i)).toBeInTheDocument();
});
