import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AnnouncementBanner } from './AnnouncementBanner';

const renderBanner = (props) => render(<MemoryRouter><AnnouncementBanner {...props} /></MemoryRouter>);

test('navigates through slides and links Our Story to /about', () => {
  renderBanner({ onOpenWaitlist: jest.fn() });
  expect(screen.getByRole('button', { name: /get on list/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /next slide/i }));
  fireEvent.click(screen.getByRole('button', { name: /next slide/i }));
  expect(screen.getByText(/MADE IN DALLAS, TX, USA/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /our story/i })).toHaveAttribute('href', '/about');
});

test('waitlist slide CTA opens the waitlist', () => {
  const onOpenWaitlist = jest.fn();
  renderBanner({ onOpenWaitlist });

  fireEvent.click(screen.getByRole('button', { name: /go to slide 1/i }));
  fireEvent.click(screen.getByRole('button', { name: /get on list/i }));
  expect(onOpenWaitlist).toHaveBeenCalledTimes(1);
});

test('subscribe slide shows the updated copy and scrolls to the product grid', () => {
  const scrollIntoView = jest.fn();
  document.body.insertAdjacentHTML('beforeend', '<main id="subscribe"></main>');
  document.getElementById('subscribe').scrollIntoView = scrollIntoView;
  renderBanner({ onOpenWaitlist: jest.fn() });

  fireEvent.click(screen.getByRole('button', { name: /go to slide 4/i }));
  expect(screen.getByText(/Pause or cancel anytime/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /shop essentials/i }));
  expect(scrollIntoView).toHaveBeenCalled();
  document.getElementById('subscribe').remove();
});
