import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DumaPage } from './DumaPage';

jest.mock('../utils/useIsMobile', () => ({ useIsMobile: () => false }));
jest.mock('../utils/moderation', () => ({ ...jest.requireActual('../utils/moderation'), useModeration: () => ({ isHiddenItem: () => false, isBlocked: () => false, hidden: [] }) }));
jest.mock('../components/EzoicAd', () => ({ EzoicAd: () => null }));
const response = (data, status = 200) => ({ ok: status === 200, status, json: async () => data });
const show = (view = 'recommendations', props = {}) => render(<HelmetProvider><MemoryRouter initialEntries={[`/duma?view=${view}`]}><DumaPage items={[]} authToken="test-token" {...props} /></MemoryRouter></HelmetProvider>);
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
  // A 5xx is retried (the server may be waking up) before the error is shown.
  expect(await screen.findByRole('alert', {}, { timeout: 12000 })).toHaveTextContent('500');
  expect(global.fetch.mock.calls.filter(([url]) => url.endsWith('/api/duma')).length).toBe(3);
  expect(screen.queryByText(/No product recommendations yet/)).not.toBeInTheDocument();
  fail = false;
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByRole('heading', { name: 'Saved recommendation by Example' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
}, 20000);

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

test('Influencers tab shows creator applications and creator posts to members, not other partners', async () => {
  const feed = [
    { _id: '111111111111111111111111', type: 'Partner', partnerCategory: 'Creator / Influencer Partners', company: 'Ada Creates', influencer: true, mediaUrls: [], comments: [] },
    { _id: '222222222222222222222222', type: 'Culture', category: 'Culture', influencer: true, prompt: 'My 3-bottle hair routine', response: 'Wash day with the full set', comments: [] },
    { _id: '333333333333333333333333', type: 'Partner', partnerCategory: 'Brand & Retail Partners', company: 'Bo Supply', comments: [] },
    { _id: '444444444444444444444444', type: 'Culture', category: 'Culture', prompt: 'Regular perspective', response: 'Not a creator', comments: [] },
  ];
  global.fetch = jest.fn(async url => response(url.endsWith('/api/marketplace') ? [] : feed));
  show('influencers');
  expect(await screen.findByRole('heading', { name: 'Ada Creates joined as a Creator / Influencer partner' })).toBeInTheDocument();
  expect(screen.getByText('Wash day with the full set')).toBeInTheDocument();
  expect(screen.queryByText(/Bo Supply/)).not.toBeInTheDocument();
  expect(screen.queryByText('Not a creator')).not.toBeInTheDocument();
  // Influencers is an Economics sub-section next to Recommendations, Partners and Marketplace
  expect(screen.getByRole('button', { name: /^Economics/ })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Influencers (2)' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByLabelText('Economics sections')).toHaveTextContent(/Recommendations.*Partners.*Influencers.*Marketplace/);
  // Creator posts stay in Culture too
  fireEvent.click(screen.getByRole('button', { name: /^Culture/ }));
  expect(await screen.findByText('Wash day with the full set')).toBeInTheDocument();
});

test('signed-out visitors must sign in to see Economics, but can still read Culture', async () => {
  const feed = [
    { _id: '555555555555555555555555', type: 'Product Recommendation', name: 'Secret recommendation', brand: 'Example', reason: 'Members only', comments: [] },
    { _id: '666666666666666666666666', type: 'Culture', category: 'Culture', prompt: 'Open prompt', response: 'Public perspective', comments: [] },
  ];
  global.fetch = jest.fn(async url => response(url.endsWith('/api/marketplace') ? [] : feed));
  show('recommendations', { authToken: undefined });
  expect(await screen.findByRole('heading', { name: 'Sign in to see Economics' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/login');
  expect(screen.queryByText(/Secret recommendation/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Economics/ })).toHaveTextContent('Economics (🔒)');
  fireEvent.click(screen.getByRole('button', { name: /^Culture/ }));
  expect(await screen.findByText('Public perspective')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Sign in to see Economics' })).not.toBeInTheDocument();
});

test('Culture › Influencers shows creator posts and reviews with their product link, not other culture posts', async () => {
  const review = { _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', type: 'Culture', category: 'Culture', influencer: true, creatorReview: true, prompt: 'Ada on The Majorities Shampoo - 100ml', response: 'Lovely lather.', productTitle: 'The Majorities Shampoo - 100ml', productUrl: 'https://themajorities.com/products/the-majorities-shampoo', comments: [] };
  const regular = { _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', type: 'Culture', category: 'Culture', prompt: 'What makes a person beautiful?', response: 'Kindness.', comments: [] };
  global.fetch = jest.fn(async url => (url.endsWith('/api/duma') ? response([review, regular]) : response([])));
  show('culture-influencers');
  expect(await screen.findByRole('heading', { name: 'Ada on The Majorities Shampoo - 100ml' })).toBeInTheDocument();
  expect(screen.getByText('Creator Review')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /View The Majorities Shampoo - 100ml/ })).toHaveAttribute('href', 'https://themajorities.com/products/the-majorities-shampoo');
  expect(screen.queryByText('Kindness.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^All \(/ }));
  expect(await screen.findByText('Kindness.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Influencers (1)' })).toHaveAttribute('aria-pressed', 'false');
});

test('Culture › Influencers shows the creator application with its submitted photo, not every post the creator makes', async () => {
  const application = { _id: 'cccccccccccccccccccccccc', type: 'Partner', partnerCategory: 'Creator / Influencer Partners', desc: 'Creator / Influencer Partners', company: 'Nakisha', influencer: true, mediaUrls: ['https://res.cloudinary.com/demo/image/upload/v1/user_media/pitch.jpg'], comments: [] };
  // The server tags every post by a creator `influencer`; an everyday post must stay in All only
  const everyday = { _id: 'dddddddddddddddddddddddd', type: 'Culture', category: 'Culture', influencer: true, prompt: "What's a fun local spot?", response: 'Mavericks Dance Hall is the best.', comments: [] };
  global.fetch = jest.fn(async url => (url.endsWith('/api/duma') ? response([application, everyday]) : response([])));
  show('culture-influencers');
  expect(await screen.findByRole('heading', { name: 'Nakisha joined as a Creator / Influencer partner' })).toBeInTheDocument();
  expect(screen.getByText('New Creator')).toBeInTheDocument();
  expect(screen.getByAltText('Attachment 1').getAttribute('src')).toContain('pitch.jpg');
  expect(screen.queryByText('Mavericks Dance Hall is the best.')).not.toBeInTheDocument();
  expect(screen.queryByText('Creator / Influencer Partners')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Influencers (1)' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: /^All \(/ }));
  expect(await screen.findByText('Mavericks Dance Hall is the best.')).toBeInTheDocument();
});

test('Culture › Influencers keeps creator applications members-only, like the rest of Economics', async () => {
  const application = { _id: 'eeeeeeeeeeeeeeeeeeeeeeee', type: 'Partner', partnerCategory: 'Creator / Influencer Partners', company: 'Nakisha', mediaUrls: [], comments: [] };
  global.fetch = jest.fn(async url => (url.endsWith('/api/duma') ? response([application]) : response([])));
  show('culture-influencers', { authToken: null });
  expect(await screen.findByText(/No creators yet/)).toBeInTheDocument();
  expect(screen.queryByText(/Nakisha joined/)).not.toBeInTheDocument();
});

test('feed photos stay centred on the focus point their author chose', async () => {
  const post = { _id: 'ffffffffffffffffffffffff', type: 'Culture', category: 'Culture', prompt: 'P', response: 'R', mediaUrls: ['https://res.cloudinary.com/demo/image/upload/v1/user_media/pitch.jpg#focus=30,10'], comments: [] };
  global.fetch = jest.fn(async url => (url.endsWith('/api/duma') ? response([post]) : response([])));
  show('culture');
  const img = await screen.findByAltText('Attachment 1');
  expect(img.style.objectPosition).toBe('30% 10%');
  expect(img.getAttribute('src')).not.toContain('#focus');
});

test('the "Become a creator" invite shows to non-affiliates only', async () => {
  const application = { _id: '999999999999999999999999', type: 'Partner', partnerCategory: 'Creator / Influencer Partners', company: 'Ada', submittedBy: 'ada@example.com', mediaUrls: [], comments: [] };
  global.fetch = jest.fn(async url => (url.endsWith('/api/duma') ? response([application]) : response([])));
  const view = show('influencers', { userEmail: 'someone@example.com' });
  expect(await screen.findByText(/We need new affiliates\./)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Become a creator →' })).toBeInTheDocument();
  view.unmount();

  // Ada already applied, so she isn't invited again
  show('influencers', { userEmail: 'Ada@example.com' });
  expect(await screen.findByRole('heading', { name: 'Ada joined as a Creator / Influencer partner' })).toBeInTheDocument();
  expect(screen.queryByText(/We need new affiliates/)).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Become a creator →' })).not.toBeInTheDocument();
});
