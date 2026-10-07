import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddressLink } from './AddressLink';
import { googleMapsUrl, isSpecificAddress } from '../utils/maps';

test('links a full address to Google Maps in a new tab', () => {
  render(<AddressLink address="Nowhere Deep Ellum, 2826 Elm St, Dallas, TX 75226, USA" />);
  const link = screen.getByRole('link', { name: 'Open Nowhere Deep Ellum, 2826 Elm St, Dallas, TX 75226, USA in Google Maps' });
  expect(link).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=Nowhere%20Deep%20Ellum%2C%202826%20Elm%20St%2C%20Dallas%2C%20TX%2075226%2C%20USA');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  expect(link).toHaveTextContent('📍 Nowhere Deep Ellum');
});

test('encodes #, & and accents', () => {
  expect(googleMapsUrl('Ben & Jerry #4, Café Rd')).toBe('https://www.google.com/maps/search/?api=1&query=Ben%20%26%20Jerry%20%234%2C%20Caf%C3%A9%20Rd');
});

test('leaves a bare city as plain text', () => {
  render(<AddressLink address="Dallas, TX" />);
  expect(screen.queryByRole('link')).toBeNull();
  expect(screen.getByText('📍 Dallas, TX')).toBeInTheDocument();
  expect(isSpecificAddress('Dallas, TX, USA')).toBe(false);
  expect(isSpecificAddress('Klyde Warren Park, Dallas, TX, USA')).toBe(true);
});

test('renders nothing for an empty location', () => {
  const { container } = render(<AddressLink address="  " />);
  expect(container).toBeEmptyDOMElement();
});

test('clicking the address does not trigger the surrounding card', () => {
  const onCardClick = jest.fn();
  render(<div onClick={onCardClick}><AddressLink address="2826 Elm St, Dallas, TX 75226" variant="inline" /></div>);
  fireEvent.click(screen.getByRole('link'));
  expect(onCardClick).not.toHaveBeenCalled();
});
