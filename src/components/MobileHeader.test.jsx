import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';

jest.mock('../utils/cart', () => ({
  useCart: () => ({ lines: [], count: 0, subtotal: 0, wishlist: [], cartOpen: false, setCartOpen: jest.fn() }),
  checkoutCart: jest.fn(),
}));

for (const signedIn of [false, true]) {
  test(`member-only navigation follows sign-in state (signed in: ${signedIn})`, () => {
    render(<MemoryRouter><MobileHeader isLoggedIn={signedIn} unreadMessages={0} onLogout={jest.fn()} /></MemoryRouter>);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const publicItems = ['Home', 'Hair Care', 'Skin Care', 'Wholesale', 'The Duma', 'Partner'];
    expect(within(nav).getAllByRole('button').map(button => button.textContent)).toEqual(signedIn ? [...publicItems, 'Recommend', 'Messages'] : publicItems);
    if (!signedIn) expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/login');
  });
}

test('signed-in account icon opens profile and logout actions', () => {
  const onLogout = jest.fn();
  render(<MemoryRouter><MobileHeader isLoggedIn unreadMessages={2} onLogout={onLogout} /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Account' }));
  expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile');
  fireEvent.click(screen.getAllByRole('button', { name: 'Log out' })[0]);
  expect(onLogout).toHaveBeenCalledTimes(1);
});
