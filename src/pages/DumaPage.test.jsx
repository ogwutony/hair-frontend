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

test('a single feed photo is shown whole, not cropped', async () => {
  const post = { _id: 'eeeeeeeeeeeeeeeeeeeeeeee', type: 'Culture', category: 'Culture', prompt: 'P', response: 'R', mediaUrls: ['https://res.cloudinary.com/demo/image/upload/v1/user_media/tall.jpg'], comments: [] };
  global.fetch = jest.fn(async url => (url.endsWith('/api/duma') ? response([post]) : response([])));
  show('culture');
  const img = await screen.findByAltText('Attachment 1');
  expect(img.style.objectFit).toBe('contain');
  expect(img.style.height).toBe('auto');
  expect(img.style.maxHeight).toBe('600px');
});

test('cropped grid photos without a focus point keep their top in view', async () => {
  const post = { _id: 'dddddddddddddddddddddddd', type: 'Culture', category: 'Culture', prompt: 'P', response: 'R', mediaUrls: ['https://res.cloudinary.com/demo/image/upload/v1/user_media/a.jpg', 'https://res.cloudinary.com/demo/image/upload/v1/user_media/b.jpg'], comments: [] };
  global.fetch = jest.fn(async url => (url.endsWith('/api/duma') ? response([post]) : response([])));
  show('culture');
  const img = await screen.findByAltText('Attachment 1');
  expect(img.style.objectFit).toBe('cover');
  expect(img.style.objectPosition).toBe('50% 0%');
});

test('cropped grid photos stay centred on the focus point their author chose', async () => {
  const post = { _id: 'ffffffffffffffffffffffff', type: 'Culture', category: 'Culture', prompt: 'P', response: 'R', mediaUrls: ['https://res.cloudinary.com/demo/image/upload/v1/user_media/pitch.jpg#focus=30,10', 'https://res.cloudinary.com/demo/image/upload/v1/user_media/b.jpg'], comments: [] };
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

// One of each kind of post, as /api/duma returns them
const PHOTO = 'https://res.cloudinary.com/demo/image/upload/v1/user_media/pitch.jpg';
const FEED = [
  { _id: 'a00000000000000000000001', type: 'Partner', partnerCategory: 'Creator / Influencer Partners', desc: 'Creator / Influencer Partners', company: 'Nakisha', influencer: true, mediaUrls: [PHOTO], comments: [] },
  { _id: 'a00000000000000000000002', type: 'Partner', partnerCategory: 'Review Request', desc: 'Review Request', company: 'Mavericks Dance Hall', reviewTargetType: 'Bar', websiteLink: 'https://mavericks.example', mediaUrls: [], comments: [] },
  { _id: 'a00000000000000000000003', type: 'Partner', partnerCategory: 'Brand & Retail Partners', company: 'Bo Supply', comments: [] },
  { _id: 'a00000000000000000000004', type: 'Partner', partnerCategory: 'Community / Venue Partners', company: 'Run Club Dallas', comments: [] },
  { _id: 'a00000000000000000000005', type: 'Partner', partnerCategory: 'Marketplace Access', company: 'Shea Shop', comments: [] },
  // A creator's everyday post: the server tags it influencer, but it isn't an affiliate post
  { _id: 'a00000000000000000000006', type: 'Culture', category: 'Culture', influencer: true, prompt: 'Fun local spot?', response: 'Mavericks is the best.', comments: [] },
  // Posted from the Creator Task Checklist on themajorities.com/pages/influencers
  { _id: 'a00000000000000000000007', type: 'Culture', category: 'Culture', influencer: true, creatorReview: true, prompt: 'Ada on The Majorities Shampoo - 100ml', response: 'Lovely lather.', productTitle: 'The Majorities Shampoo - 100ml', productUrl: 'https://themajorities.com/products/the-majorities-shampoo', comments: [] },
];
const feedFetch = () => jest.fn(async url => (url.endsWith('/api/duma') ? response(FEED) : response([])));
const tab = (name) => screen.getByRole('button', { name: new RegExp(`^${name} \\(`) });

test('Economics has a tab for each partner category on the Partner page, and no Partners or Influencers tab', async () => {
  global.fetch = feedFetch();
  show('wholesale');
  expect(await screen.findByRole('heading', { name: /Bo Supply/ })).toBeInTheDocument();
  const sections = screen.getByLabelText('Economics sections');
  expect(sections).toHaveTextContent(/^Recommendations.*Wholesale.*Community.*Access Request.*Marketplace/);
  expect(sections).not.toHaveTextContent(/Partners|Influencers/);
  expect(screen.getByText(/Wholesale, Distributor, and Retail Partners\./)).toBeInTheDocument();
  expect(screen.queryByText(/Run Club Dallas|Shea Shop|Nakisha|Mavericks Dance Hall/)).not.toBeInTheDocument();

  fireEvent.click(tab('Community'));
  expect(await screen.findByRole('heading', { name: /Run Club Dallas/ })).toBeInTheDocument();
  expect(screen.queryByText(/Bo Supply/)).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Apply →' })).toHaveAttribute('href', '/partner?category=community');

  fireEvent.click(tab('Access Request'));
  expect(await screen.findByRole('heading', { name: /Shea Shop/ })).toBeInTheDocument();
  expect(screen.getByText(/Marketplace Access\./)).toBeInTheDocument();
  expect(tab('Access Request')).toHaveTextContent('Access Request (1)');
});

test('Culture has All, Affiliates, Review Request and Affiliate posts tabs, each with its own posts', async () => {
  global.fetch = feedFetch();
  show('culture-affiliates', { userEmail: 'someone@example.com' });
  expect(await screen.findByRole('heading', { name: 'Nakisha joined as a Creator / Influencer partner' })).toBeInTheDocument();
  expect(screen.getByLabelText('Culture sections')).toHaveTextContent(/^All.*Affiliates \(1\).*Review Request \(1\).*Affiliate posts \(1\)/);
  // Affiliates: the application with its submitted photo, not the creator's everyday posts
  expect(screen.getByAltText('Attachment 1').getAttribute('src')).toContain('pitch.jpg');
  expect(screen.queryByText('Mavericks is the best.')).not.toBeInTheDocument();
  expect(screen.getByText(/We need new affiliates/)).toBeInTheDocument();

  fireEvent.click(tab('Review Request'));
  expect(await screen.findByRole('heading', { name: 'Mavericks Dance Hall requested a review · Bar' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Visit their website →' })).toHaveAttribute('href', 'https://mavericks.example');
  expect(screen.getByRole('link', { name: 'Request a review →' })).toHaveAttribute('href', '/partner?category=review');
  expect(screen.queryByText(/Nakisha/)).not.toBeInTheDocument();

  // Affiliate posts: only posts sent from the Influencers checklist page
  fireEvent.click(tab('Affiliate posts'));
  expect(await screen.findByRole('heading', { name: 'Ada on The Majorities Shampoo - 100ml' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /View The Majorities Shampoo - 100ml/ })).toHaveAttribute('href', 'https://themajorities.com/products/the-majorities-shampoo');
  expect(screen.queryByText('Mavericks is the best.')).not.toBeInTheDocument();
  expect(screen.queryByText(/Nakisha joined/)).not.toBeInTheDocument();

  // Everyday posts (affiliate or not) are in All
  fireEvent.click(tab('All'));
  expect(await screen.findByText('Mavericks is the best.')).toBeInTheDocument();
});

test('old Duma links still open the matching tab', async () => {
  global.fetch = feedFetch();
  const cases = [
    ['partners', 'Economics', 'Wholesale'],
    ['influencers', 'Culture', 'Affiliates'],
    ['culture-influencers', 'Culture', 'Affiliate posts'],
  ];
  for (const [view, section, sub] of cases) {
    const rendered = show(view);
    expect(await screen.findByRole('button', { name: new RegExp(`^${section} \\(`), pressed: true })).toBeInTheDocument();
    expect(tab(sub)).toHaveAttribute('aria-pressed', 'true');
    rendered.unmount();
  }
});

test('signed-out visitors see Affiliate posts, but must sign in for Affiliates and Review Request', async () => {
  global.fetch = feedFetch();
  show('culture-affiliates', { authToken: null });
  expect(await screen.findByRole('heading', { name: 'Sign in to see our affiliates' })).toBeInTheDocument();
  expect(screen.queryByText(/Nakisha/)).not.toBeInTheDocument();
  expect(tab('Affiliates')).toHaveTextContent('Affiliates (🔒)');
  fireEvent.click(tab('Review Request'));
  expect(await screen.findByRole('heading', { name: 'Sign in to see review requests' })).toBeInTheDocument();
  expect(screen.queryByText(/Mavericks Dance Hall/)).not.toBeInTheDocument();
  fireEvent.click(tab('Affiliate posts'));
  expect(await screen.findByRole('heading', { name: 'Ada on The Majorities Shampoo - 100ml' })).toBeInTheDocument();
});
