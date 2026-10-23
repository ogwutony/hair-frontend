import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AnnouncementBanner } from './AnnouncementBanner';

const renderBanner = (props) => render(<MemoryRouter><AnnouncementBanner {...props} /></MemoryRouter>);

test('navigates through slides and links Our Story to /about', () => {
  renderBanner({ onOpenWaitlist: jest.fn() });
  expect(screen.getByText('CUSTOM BUNDLE')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /next slide/i }));
  expect(screen.getByText('OUR MISSION')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /our story/i })).toHaveAttribute('href', '/about');
});

test('waitlist slide CTA opens the waitlist', () => {
  const onOpenWaitlist = jest.fn();
  renderBanner({ onOpenWaitlist });

  fireEvent.click(screen.getByRole('button', { name: /go to slide 3/i }));
  fireEvent.click(screen.getByRole('button', { name: /get on list/i }));
  expect(onOpenWaitlist).toHaveBeenCalledTimes(1);
});
