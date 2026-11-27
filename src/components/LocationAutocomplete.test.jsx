import React, { useState } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { LocationAutocomplete as Component, __resetLocationAutocompleteForTests } from './LocationAutocomplete';

const KEY = 'test-key';

const Harness = ({ LocationAutocomplete, onValue }) => {
  const [v, setV] = useState('');
  return <LocationAutocomplete value={v} onChange={(x) => { setV(x); onValue && onValue(x); }} placeholder="Tag a location..." />;
};

const makePrediction = (main, secondary, details) => ({
  placeId: main,
  mainText: { toString: () => main },
  secondaryText: { toString: () => secondary },
  text: { toString: () => `${main}, ${secondary}` },
  toPlace: () => ({
    fetchFields: jest.fn().mockResolvedValue(undefined),
    ...details,
  }),
});

const setup = (places) => {
  window.google = { maps: { importLibrary: jest.fn().mockResolvedValue(places) } };
  __resetLocationAutocompleteForTests();
  return Component;
};

const typeAndWait = async (input, text) => {
  fireEvent.change(input, { target: { value: text } });
  await act(async () => { jest.advanceTimersByTime(300); });
};

beforeEach(() => {
  jest.useFakeTimers();
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY = KEY;
  delete window.__locationAuthFailed;
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  delete window.google;
  jest.restoreAllMocks();
});

test('shows Places API (New) suggestions and fills the full place label when one is picked', async () => {
  const fetchAutocompleteSuggestions = jest.fn().mockResolvedValue({
    suggestions: [{ placePrediction: makePrediction('Massey Shots Bar & Grill', 'Dallas, TX, USA', {
      displayName: 'Massey Shots Bar & Grill', formattedAddress: '123 Main St, Dallas, TX 75201, USA',
    }) }],
  });
  const LocationAutocomplete = setup({
    AutocompleteSuggestion: { fetchAutocompleteSuggestions },
    AutocompleteSessionToken: function Token() {},
  });
  const onValue = jest.fn();
  render(<Harness LocationAutocomplete={LocationAutocomplete} onValue={onValue} />);
  const input = screen.getByPlaceholderText('Tag a location...');
  await act(async () => {}); // let the library load

  await typeAndWait(input, 'Massey');
  expect(fetchAutocompleteSuggestions).toHaveBeenCalledWith(expect.objectContaining({ input: 'Massey' }));
  const option = await screen.findByRole('option', { name: /Massey Shots Bar & Grill/ });

  await act(async () => { fireEvent.mouseDown(option); });
  await waitFor(() => expect(input.value).toBe('Massey Shots Bar & Grill, 123 Main St, Dallas, TX 75201, USA'));
  expect(screen.queryByRole('listbox')).toBeNull();
});

test('keyboard: arrow down + Enter picks a suggestion without submitting the form', async () => {
  const fetchAutocompleteSuggestions = jest.fn().mockResolvedValue({
    suggestions: [
      { placePrediction: makePrediction('Dallas', 'TX, USA', { displayName: 'Dallas', formattedAddress: 'Dallas, TX, USA' }) },
      { placePrediction: makePrediction('Dallas Arboretum', 'Garland Rd, Dallas, TX, USA', { displayName: 'Dallas Arboretum', formattedAddress: '8525 Garland Rd, Dallas, TX 75218, USA' }) },
    ],
  });
  const LocationAutocomplete = setup({ AutocompleteSuggestion: { fetchAutocompleteSuggestions } });
  const onSubmit = jest.fn((e) => e.preventDefault());
  render(<form onSubmit={onSubmit}><Harness LocationAutocomplete={LocationAutocomplete} /></form>);
  const input = screen.getByPlaceholderText('Tag a location...');
  await act(async () => {});

  await typeAndWait(input, 'Dallas');
  await screen.findAllByRole('option');
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });

  await waitFor(() => expect(input.value).toBe('Dallas Arboretum, 8525 Garland Rd, Dallas, TX 75218, USA'));
  expect(onSubmit).not.toHaveBeenCalled();
});

test('falls back to the classic Places widget when the new API is not enabled on the key', async () => {
  const addListener = jest.fn();
  const Autocomplete = jest.fn(function () { this.addListener = addListener; this.getPlace = () => ({}); });
  const LocationAutocomplete = setup({
    AutocompleteSuggestion: { fetchAutocompleteSuggestions: jest.fn().mockRejectedValue(new Error('PERMISSION_DENIED')) },
    Autocomplete,
  });
  render(<Harness LocationAutocomplete={LocationAutocomplete} />);
  const input = screen.getByPlaceholderText('Tag a location...');
  await act(async () => {});

  await typeAndWait(input, 'Massey');
  expect(Autocomplete).toHaveBeenCalledWith(input, { fields: ['formatted_address', 'name'] });
  expect(addListener).toHaveBeenCalledWith('place_changed', expect.any(Function));
});

const jsonResponse = (body, ok = true) => ({ ok, status: ok ? 200 : 502, json: async () => body });

test('without an API key, suggestions come from the OpenStreetMap proxy', async () => {
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY = '';
  global.fetch = jest.fn().mockResolvedValue(jsonResponse({
    results: [{ id: 'n1', main: 'Klyde Warren Park', secondary: 'Dallas, Texas, United States', label: 'Klyde Warren Park, Dallas, Texas, United States' }],
  }));
  const fetchAutocompleteSuggestions = jest.fn();
  const LocationAutocomplete = setup({ AutocompleteSuggestion: { fetchAutocompleteSuggestions } });
  render(<Harness LocationAutocomplete={LocationAutocomplete} />);
  const input = screen.getByPlaceholderText('Tag a location...');
  await act(async () => {});

  await typeAndWait(input, 'Klyde');
  await act(async () => { jest.advanceTimersByTime(200); });
  expect(global.fetch).toHaveBeenCalledWith('/api/geocode?q=Klyde', expect.anything());
  const option = await screen.findByRole('option', { name: /Klyde Warren Park/ });
  await act(async () => { fireEvent.mouseDown(option); });
  expect(input.value).toBe('Klyde Warren Park, Dallas, Texas, United States');
  expect(fetchAutocompleteSuggestions).not.toHaveBeenCalled();
  delete global.fetch;
});

test('stays a plain text field when no key is set and the proxy is down', async () => {
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY = '';
  global.fetch = jest.fn().mockResolvedValue(jsonResponse({ results: [] }, false));
  const LocationAutocomplete = setup({ AutocompleteSuggestion: { fetchAutocompleteSuggestions: jest.fn() } });
  render(<Harness LocationAutocomplete={LocationAutocomplete} />);
  const input = screen.getByPlaceholderText('Tag a location...');
  await act(async () => {});

  await typeAndWait(input, 'My backyard');
  await act(async () => { jest.advanceTimersByTime(200); });
  expect(input.value).toBe('My backyard');
  expect(input.disabled).toBe(false);
  expect(screen.queryByRole('listbox')).toBeNull();
  delete global.fetch;
});

describe('use my current location', () => {
  const realGeo = navigator.geolocation;
  const mockGeo = (impl) => Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition: jest.fn(impl) }, configurable: true });
  afterEach(() => { Object.defineProperty(navigator, 'geolocation', { value: realGeo, configurable: true }); delete global.fetch; });

  test('fills the field with the reverse-geocoded place', async () => {
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY = '';
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ results: [{ id: 'r', main: 'Deep Ellum', secondary: 'Dallas, Texas, United States', label: 'Deep Ellum, Dallas, Texas, United States' }] }));
    mockGeo((ok) => ok({ coords: { latitude: 32.78, longitude: -96.78 } }));
    const LocationAutocomplete = setup({});
    const Wrapped = (props) => <LocationAutocomplete allowCurrentLocation {...props} />;
    render(<Harness LocationAutocomplete={Wrapped} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /use my current location/i })); });
    await waitFor(() => expect(screen.getByPlaceholderText('Tag a location...').value).toBe('Deep Ellum, Dallas, Texas, United States'));
    expect(global.fetch).toHaveBeenCalledWith('/api/geocode?lat=32.78&lon=-96.78', expect.anything());
  });

  test('explains a denied permission', async () => {
    mockGeo((ok, fail) => fail({ code: 1, message: 'denied' }));
    const LocationAutocomplete = setup({});
    const Wrapped = (props) => <LocationAutocomplete allowCurrentLocation {...props} />;
    render(<Harness LocationAutocomplete={Wrapped} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /use my current location/i })); });
    expect(screen.getByRole('status')).toHaveTextContent(/permission was denied/i);
  });
});

test('re-enables the field if Google rejects the key', async () => {
  const LocationAutocomplete = setup({ AutocompleteSuggestion: { fetchAutocompleteSuggestions: jest.fn() } });
  render(<Harness LocationAutocomplete={LocationAutocomplete} />);
  const input = screen.getByPlaceholderText('Tag a location...');
  await act(async () => {});

  // Simulate what Google does on a rejected key
  input.disabled = true;
  input.classList.add('gm-err-autocomplete');
  await act(async () => { window.gm_authFailure(); jest.advanceTimersByTime(2000); });

  expect(input.disabled).toBe(false);
  expect(input.classList.contains('gm-err-autocomplete')).toBe(false);
  expect(input.placeholder).toBe('Tag a location...');
});
