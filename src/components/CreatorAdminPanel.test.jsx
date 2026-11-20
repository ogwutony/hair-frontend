import { render, screen, fireEvent } from '@testing-library/react';
import { CreatorAdminPanel, extractPostId } from './CreatorAdminPanel';

const response = (data, status = 200) => ({ ok: status === 200, status, json: async () => data });

test('extractPostId accepts a post link or a bare id', () => {
  expect(extractPostId('https://community.themajorities.com/duma/aaaaaaaaaaaaaaaaaaaaaaaa')).toBe('aaaaaaaaaaaaaaaaaaaaaaaa');
  expect(extractPostId(' bbbbbbbbbbbbbbbbbbbbbbbb ')).toBe('bbbbbbbbbbbbbbbbbbbbbbbb');
  expect(extractPostId('https://example.com/not-a-post')).toBe('');
});

test('approving an applicant issues a code and shows it', async () => {
  let issued = false;
  global.fetch = jest.fn(async (url, options = {}) => {
    if (url.endsWith('/api/admin/creators/code')) {
      expect(JSON.parse(options.body)).toEqual({ email: 'ada@example.com', reissue: false });
      issued = true;
      return response({ email: 'ada@example.com', creatorCode: 'TM-ABCD-EFGH', issued: true });
    }
    return response([{ email: 'ada@example.com', displayName: 'Ada', creatorCode: issued ? 'TM-ABCD-EFGH' : null, creatorPoints: 0, submissions: 0 }]);
  });
  render(<CreatorAdminPanel authToken="t" />);
  fireEvent.click(await screen.findByRole('button', { name: /Approve & issue code/ }));
  expect(await screen.findByText(/Code TM-ABCD-EFGH issued to ada@example.com/)).toBeInTheDocument();
  expect(await screen.findByText('TM-ABCD-EFGH')).toBeInTheDocument();
});

test('hide control sends the post id from a pasted link', async () => {
  global.fetch = jest.fn(async () => response([]));
  render(<CreatorAdminPanel authToken="t" />);
  fireEvent.change(screen.getByLabelText('Hide a Duma post:'), { target: { value: 'https://community.themajorities.com/duma/cccccccccccccccccccccccc' } });
  fireEvent.click(screen.getByRole('button', { name: 'Hide now' }));
  expect(await screen.findByText('Post hidden from the Duma.')).toBeInTheDocument();
  expect(global.fetch.mock.calls.some(([url]) => url.endsWith('/api/admin/duma/cccccccccccccccccccccccc/hide'))).toBe(true);
});
