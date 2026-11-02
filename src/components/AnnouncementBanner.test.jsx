import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AnnouncementBanner } from './AnnouncementBanner';

const renderBanner = (props) => render(<MemoryRouter><AnnouncementBanner {...props} /></MemoryRouter>);

test('opens on the subscribe slide and has no waitlist', () => {
  renderBanner({ onOpenWaitlist: jest.fn() });
  expect(screen.getByRole('button', { name: /shop essentials/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /get on list/i })).not.toBeInTheDocument();
});

test('navigates through slides and links Our Story to /about', () => {
  renderBanner({ onOpenWaitlist: jest.fn() });
  fireEvent.click(screen.getByRole('button', { name: /next slide/i }));
  fireEvent.click(screen.getByRole('button', { name: /next slide/i }));
  expect(screen.getByText(/^The Majorities is a company built of the people, by the people, and for the people$/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /our story/i })).toHaveAttribute('href', '/about');
});

test('subscribe slide shows the updated copy and scrolls to the product grid', () => {
  const scrollIntoView = jest.fn();
  document.body.insertAdjacentHTML('beforeend', '<main id="subscribe"></main>');
  document.getElementById('subscribe').scrollIntoView = scrollIntoView;
  renderBanner({ onOpenWaitlist: jest.fn() });

  fireEvent.click(screen.getByRole('button', { name: /go to slide 1/i }));
  expect(screen.getByText(/Pause or cancel anytime/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /shop essentials/i }));
  expect(scrollIntoView).toHaveBeenCalled();
  document.getElementById('subscribe').remove();
});
