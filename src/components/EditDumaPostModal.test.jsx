import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditDumaPostModal } from './EditDumaPostModal';

const PHOTO = 'https://res.cloudinary.com/demo/image/upload/v1/user_media/pitch.jpg';

afterEach(() => { jest.restoreAllMocks(); delete global.fetch; });

const savedBody = () => JSON.parse(global.fetch.mock.calls[0][1].body);

test('an author can set a photo focus point and it is saved with the photo', async () => {
  global.fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({}) }));
  const onSaved = jest.fn();
  const item = { _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', type: 'Culture', prompt: 'Prompt', response: 'Text', mediaUrls: [PHOTO] };
  render(<EditDumaPostModal item={item} authToken="t" onClose={() => {}} onSaved={onSaved} />);

  fireEvent.click(screen.getByRole('button', { name: 'Set photo focus' }));
  const slider = screen.getByRole('slider', { name: 'Photo focus point' });
  ['ArrowUp', 'ArrowUp', 'ArrowRight'].forEach((key) => fireEvent.keyDown(slider, { key }));
  expect(slider).toHaveAttribute('aria-valuetext', '52% across, 46% down');
  fireEvent.click(screen.getByRole('button', { name: 'Save focus' }));
  // The picker closes and the edit dialog stays open
  expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  expect(screen.getByRole('dialog', { name: 'Edit post' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(onSaved).toHaveBeenCalled());
  expect(savedBody().mediaUrls).toEqual([`${PHOTO}#focus=52,46`]);
});

test('a creator application only edits its photos', async () => {
  global.fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({}) }));
  const item = { _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', type: 'Partner', partnerCategory: 'Creator / Influencer Partners', mediaUrls: [`${PHOTO}#focus=50,10`] };
  render(<EditDumaPostModal item={item} authToken="t" onClose={() => {}} onSaved={() => {}} />);
  expect(screen.getByRole('dialog', { name: 'Edit photos' })).toBeInTheDocument();
  expect(screen.queryByLabelText('Your post')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Set photo focus' }));
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '50% across, 10% down');
  fireEvent.click(screen.getByRole('button', { name: 'Center' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save focus' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(savedBody()).toEqual({ mediaUrls: [PHOTO] });
});
