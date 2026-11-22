import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PartnerPage, MAX_PRODUCTS, partnerRedirect, INFLUENCER_PAGE_URL, WHOLESALE_PAGE_URL } from './PartnerPage';

jest.mock('../components/CredentialHeader', () => ({ CredentialHeader: () => null }));
jest.mock('../components/LocationAutocomplete', () => ({
  LocationAutocomplete: ({ value, onChange, placeholder }) => (
    <input aria-label="Address" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
  ),
}));

const show = (props = {}) => render(
  <MemoryRouter><PartnerPage addDumaItem={jest.fn()} authToken="token" userEmail="me@example.com" {...props} /></MemoryRouter>
);
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const pick = (name) => fireEvent.click(screen.getByLabelText(name, { exact: false }));
const file = (name, mime) => new File(['x'], name, { type: mime });

beforeAll(() => { global.URL.createObjectURL = jest.fn(() => 'blob:preview'); window.scrollTo = jest.fn(); });
afterEach(() => jest.restoreAllMocks());

test('Wholesale, Distributor, and Retail is first and selected, Creator is second', () => {
  show();
  const radios = screen.getAllByRole('radio', { name: /Partners|Access|Request/ });
  expect(radios[0]).toHaveAccessibleName(expect.stringContaining('Wholesale, Distributor, and Retail Partners'));
  expect(radios[0]).toBeChecked();
  expect(radios[1]).toHaveAccessibleName(expect.stringContaining('Creator / Influencer Partners'));
  expect(screen.queryByText(/Brand & Retail/)).not.toBeInTheDocument();
});

test('wholesale flow has separate website/social fields, address, payment terms and shipping', () => {
  show();
  expect(screen.getByPlaceholderText('https://yourbrand.com')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('https://instagram.com/yourbrand')).toBeInTheDocument();
  expect(screen.getByLabelText('Address')).toBeInTheDocument();
  ['ACH', 'Credit Card', 'Pay on order', 'Net 30 payments', 'The Majorities handles shipping', 'We can handle our own shipping']
    .forEach(label => expect(screen.getByLabelText(label)).toBeInTheDocument());
  expect(screen.getByText(/Do you want The Majorities to handle shipping or can you handle shipping/)).toBeInTheDocument();
  expect(screen.queryByText(/PRODUCTS & MEDIA|PRODUCT DETAILS/)).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Product 1 name')).not.toBeInTheDocument();
});

test('menu links can open the influencer form directly', () => {
  render(<MemoryRouter initialEntries={['/partner?category=influencer']}><PartnerPage addDumaItem={jest.fn()} authToken="token" /></MemoryRouter>);
  expect(screen.getByLabelText('Creator / Influencer Partners', { exact: false })).toBeChecked();
});

test('products can be added up to the limit of 10 (marketplace)', () => {
  show();
  pick('Marketplace Access');
  for (let i = 1; i < MAX_PRODUCTS; i++) fireEvent.click(screen.getByRole('button', { name: /Add another product/ }));
  expect(screen.getByLabelText(`Product ${MAX_PRODUCTS} name`)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Add another product/ })).not.toBeInTheDocument();
  expect(screen.getByText(/maximum of 10 products/)).toBeInTheDocument();
});

test('creator flow only asks for name and email and drops the company section', () => {
  show();
  pick('Creator / Influencer Partners');
  expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
  expect(screen.getByLabelText('Business Email')).toBeInTheDocument();
  expect(screen.queryByLabelText('Phone Number')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('EIN')).not.toBeInTheDocument();
  expect(screen.queryByText(/COMPANY \/ ENTITY INFORMATION/)).not.toBeInTheDocument();
  expect(screen.getByLabelText('Instagram follower count')).toBeInTheDocument();
  expect(screen.queryByText(/CONTENT TYPE/)).not.toBeInTheDocument();
  expect(screen.getByLabelText('City')).toBeInTheDocument();
  expect(screen.getByLabelText('State')).toBeInTheDocument();
  expect(screen.getByLabelText('Country')).toHaveValue('United States');
  expect(screen.getByText(/15% Referral Commission/)).toBeInTheDocument();
  expect(screen.getByLabelText('TikTok link')).toBeInTheDocument();
  expect(screen.getByText('Have you done this before? *')).toBeInTheDocument();
  expect(screen.getByLabelText(/Sample \/ past work/)).toBeInTheDocument();
  expect(screen.getByLabelText(/Direct pitch video/)).toBeInTheDocument();
});

test('creator must upload a picture or video before submitting', () => {
  global.fetch = jest.fn();
  show();
  pick('Creator / Influencer Partners');
  type('Full Name', 'Ada');
  type('Business Email', 'ada@example.com');
  type('City', 'Dallas');
  type('State', 'TX');
  type('Instagram link', 'https://instagram.com/ada');
  type('Instagram follower count', '12000');
  pick('This would be my first brand partnership');
  fireEvent.click(screen.getByRole('button', { name: 'Submit Partnership Application' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please upload a picture of yourself or a video.');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('creator submission sends social accounts, experience and the pitch video, then goes to the Influencers page', async () => {
  jest.useFakeTimers();
  const go = jest.spyOn(partnerRedirect, 'go').mockImplementation(() => {});
  const onInfluencerApplied = jest.fn();
  global.fetch = jest.fn(async () => ({ ok: true, status: 201, json: async () => ({ item: { _id: 'abc' } }) }));
  const { container } = show({ onInfluencerApplied });
  pick('Creator / Influencer Partners');
  type('Full Name', 'Ada');
  type('Business Email', 'ada@example.com');
  type('City', 'Dallas');
  type('State', 'TX');
  type('TikTok link', 'https://tiktok.com/@ada');
  type('TikTok follower count', '50k');
  pick("I've partnered with brands");
  pick('Record yourself telling us');
  const videoInput = container.querySelector('input[type="file"][accept="video/*"]');
  fireEvent.change(videoInput, { target: { files: [file('pitch.mp4', 'video/mp4')] } });
  pick('I agree to a 15% commission rate');
  // Creators are on 15%, so the 20% marketplace commission checkbox is gone
  expect(screen.queryByLabelText('20% commission', { exact: false })).not.toBeInTheDocument();
  ['Customer Reward', 'Shipping & Returns', 'Ownership & Title'].forEach(pick);
  // Content permission and disclosure are agreed to here, not on the Influencers checklist page
  fireEvent.click(screen.getByRole('button', { name: 'Submit Partnership Application' }));
  expect(await screen.findByText('You must agree to all policies and agreements.')).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
  pick('I own my content and give The Majorities permission');
  pick('I will disclose my partnership in every post');
  fireEvent.click(screen.getByRole('button', { name: 'Submit Partnership Application' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  const body = global.fetch.mock.calls[0][1].body;
  expect(body.get('contentPermissionAgreed')).toBe('true');
  expect(body.get('partnershipDisclosureAgreed')).toBe('true');
  expect(body.get('partnerCategory')).toBe('Creator / Influencer Partners');
  expect(body.get('company')).toBe('Ada');
  expect(body.get('phoneNumber')).toBeNull();
  expect(JSON.parse(body.get('socialAccounts'))).toEqual([{ platform: 'TikTok', url: 'https://tiktok.com/@ada', followers: '50k' }]);
  expect(body.get('doneBefore')).toBe('Yes');
  expect(body.get('city')).toBe('Dallas');
  expect(body.get('state')).toBe('TX');
  expect(body.get('country')).toBe('United States');
  expect(body.get('contentTypes')).toBeNull();
  expect(body.get('videoType')).toBe('Direct pitch');
  expect(body.get('video')).toBeInstanceOf(File);
  expect(body.get('commission20AgreedTo')).toBeNull();
  expect(await screen.findByRole('button', { name: 'Submitted ✓' })).toBeDisabled();
  expect(onInfluencerApplied).toHaveBeenCalledTimes(1);
  expect(go).not.toHaveBeenCalled();
  jest.runAllTimers();
  expect(go).toHaveBeenCalledWith(INFLUENCER_PAGE_URL);
  jest.useRealTimers();
});

test('wholesale submission sends payment terms and shipping without products, then goes to the wholesale page', async () => {
  jest.useFakeTimers();
  const go = jest.spyOn(partnerRedirect, 'go').mockImplementation(() => {});
  const onWholesaleApproved = jest.fn();
  global.fetch = jest.fn(async () => ({ ok: true, status: 201, json: async () => ({ item: {}, wholesaleApproved: true }) }));
  show({ onWholesaleApproved });
  type('Full Name', 'Bo');
  type('Business Email', 'bo@shop.com');
  type('Phone Number', '555-0100');
  type('EIN', '12-3456789');
  type('Company name', 'Bo Supply');
  type('Address', 'Bo Supply, 1 Main St, Dallas, TX');
  type('Country of Origin', 'USA');
  type('Operating Country', 'USA');
  fireEvent.change(screen.getByPlaceholderText('https://yourbrand.com'), { target: { value: 'https://bo.com' } });
  pick('Wholesale & Distribution Orders');
  pick('ACH');
  pick('Net 30 payments');
  pick('We can handle our own shipping');
  ['Customer Reward', '20% commission', 'Shipping & Returns', 'Ownership & Title'].forEach(pick);
  fireEvent.click(screen.getByRole('button', { name: 'Submit Partnership Application' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  const body = global.fetch.mock.calls[0][1].body;
  expect(body.get('partnerCategory')).toBe('Brand & Retail Partners');
  expect(body.get('website')).toBe('https://bo.com');
  expect(body.get('address')).toBe('Bo Supply, 1 Main St, Dallas, TX');
  expect(body.get('paymentMethods')).toBe('ACH');
  expect(body.get('paymentSchedule')).toBe('Net 30 payments');
  expect(body.get('shippingPreference')).toBe('Partner handles shipping');
  expect(body.get('products')).toBeNull();
  expect(body.get('commission20AgreedTo')).toBe('true');
  expect(await screen.findByRole('button', { name: 'Submitted ✓' })).toBeDisabled();
  expect(onWholesaleApproved).toHaveBeenCalledTimes(1);
  jest.runAllTimers();
  expect(go).toHaveBeenCalledWith(WHOLESALE_PAGE_URL);
  jest.useRealTimers();
});
