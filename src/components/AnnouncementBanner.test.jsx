import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AnnouncementBanner } from './AnnouncementBanner';

const renderBanner = (props) => render(<MemoryRouter><AnnouncementBanner {...props} /></MemoryRouter>);

test('navigates through slides and links Our Story to /about', () => {
  renderBanner();
  expect(screen.getByRole('button', { name: /shop now/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /next slide/i }));
  fireEvent.click(screen.getByRole('button', { name: /next slide/i }));
  expect(screen.getByText(/MADE IN DALLAS, TX, USA/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /our story/i })).toHaveAttribute('href', '/about');
});

test('first slide says shop now at $54.99, with no waitlist', () => {
  const scrollIntoView = jest.fn();
  document.body.insertAdjacentHTML('beforeend', '<main id="subscribe"></main>');
  document.getElementById('subscribe').scrollIntoView = scrollIntoView;
  renderBanner();

  expect(screen.getByText(/any 6 bottles for \$54\.99 a month/i, { selector: '.active p' })).toBeInTheDocument();
  expect(screen.queryByText(/waitlist/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/\$54\.96/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /shop now/i }));
  expect(scrollIntoView).toHaveBeenCalled();
  document.getElementById('subscribe').remove();
});

test('subscribe slide shows the updated copy and scrolls to the product grid', () => {
  const scrollIntoView = jest.fn();
  document.body.insertAdjacentHTML('beforeend', '<main id="subscribe"></main>');
  document.getElementById('subscribe').scrollIntoView = scrollIntoView;
  renderBanner();

  fireEvent.click(screen.getByRole('button', { name: /go to slide 4/i }));
  expect(screen.getByText(/Pause or cancel anytime/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /shop essentials/i }));
  expect(scrollIntoView).toHaveBeenCalled();
  document.getElementById('subscribe').remove();
});
