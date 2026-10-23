import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WaitlistModal } from './WaitlistModal';
import { BACKEND_URL } from '../utils/constants';

afterEach(() => {
  jest.restoreAllMocks();
});

test('submits the selected email and routine to the waitlist API', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  });

  render(<WaitlistModal isOpen onClose={jest.fn()} />);
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'customer@example.com' } });
  fireEvent.change(screen.getByLabelText(/interested routine/i), { target: { value: '3-bottle-hair' } });
  fireEvent.click(screen.getByRole('button', { name: /reserve my spot/i }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(`${BACKEND_URL}/api/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@example.com', preference: '3-bottle-hair' }),
  }));
  expect(await screen.findByText(/you're on the list/i)).toBeInTheDocument();
});

test('shows the API error when a submission is rejected', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ success: false, message: 'Please provide a valid email address.' }),
  });

  render(<WaitlistModal isOpen onClose={jest.fn()} />);
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'customer@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /reserve my spot/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Please provide a valid email address.');
});
