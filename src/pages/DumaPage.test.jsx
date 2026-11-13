import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DumaPage } from './DumaPage';

jest.mock('../utils/useIsMobile', () => ({ useIsMobile: () => false }));
jest.mock('../utils/moderation', () => ({ useModeration: () => ({ isHiddenItem: () => false, isBlocked: () => false, hidden: [] }) }));
jest.mock('../components/EzoicAd', () => ({ EzoicAd: () => null }));
const response = (data, status = 200) => ({ ok: status === 200, status, json: async () => data });
const show = (view = 'recommendations', props = {}) => render(<HelmetProvider><MemoryRouter initialEntries={[`/duma?view=${view}`]}><DumaPage items={[]} {...props} /></MemoryRouter></HelmetProvider>);
let errorLog;
beforeEach(() => { errorLog = jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => { errorLog.mockRestore(); jest.restoreAllMocks(); });

test('pending feed shows loading instead of an empty recommendation result', () => {
  global.fetch = jest.fn(() => new Promise(() => {}));
  show();
  expect(screen.getByRole('status')).toHaveTextContent('Loading recommendations');
  expect(screen.queryByText(/No product recommendations yet/)).not.toBeInTheDocument();
});

test('failed feed shows an error and retry loads saved recommendations without category tags', async () => {
  let fail = true;
  global.fetch = jest.fn(async url => url.endsWith('/api/marketplace') ? response([]) : fail ? response({}, 500) : response([{ _id: '123456789012345678901234', type: 'Product Recommendation', name: 'Saved recommendation', brand: 'Example', reason: 'Useful', comments: [] }]));
  show();
  expect(await screen.findByRole('alert')).toHaveTextContent('500');
  expect(screen.queryByText(/No product recommendations yet/)).not.toBeInTheDocument();
  fail = false;
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByRole('heading', { name: 'Saved recommendation by Example' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('successful empty feed removes stale local entries and shows an honest empty result', async () => {
  global.fetch = jest.fn(async () => response([]));
  show('recommendations', { items: [{ _id: '123456789012345678901234', type: 'Product Recommendation', name: 'Stale local item' }] });
  expect(await screen.findByText(/No product recommendations yet/)).toBeInTheDocument();
  expect(screen.queryByText('Stale local item')).not.toBeInTheDocument();
});

test('marketplace feed renders a listing and links members to the working sell route', async () => {
  global.fetch = jest.fn(async url => response(url.endsWith('/api/marketplace') ? [{ _id: '123456789012345678901234', title: 'Saved marketplace item', description: 'Example listing', price: 15, category: 'Skin Care', externalLink: 'https://example.com' }] : []));
  show('marketplace', { authToken: 'test-token' });
  expect(await screen.findByText('Saved marketplace item')).toBeInTheDocument();
  expect(screen.getByText('$15.00')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'List a product or service' })).toHaveAttribute('href', '/sell');
});

test('invalid marketplace responses display an error instead of empty listings', async () => {
  global.fetch = jest.fn(async url => response(url.endsWith('/api/marketplace') ? { error: 'bad response' } : []));
  show('marketplace');
  expect(await screen.findByRole('alert')).toHaveTextContent('invalid feed');
  expect(screen.queryByText(/No listings yet/)).not.toBeInTheDocument();
});
