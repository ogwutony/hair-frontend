import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(null)),
}));

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
