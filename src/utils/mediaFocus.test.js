import { DEFAULT_FOCUS, focusPosition, getFocus, isVideoMediaUrl, stripFocus, withFocus } from './mediaFocus';
import { normalizeMediaVideoUrl } from './helpers';
import { sizedImageUrl } from '../components/ImageLightbox';

const PHOTO = 'https://res.cloudinary.com/demo/image/upload/v1/user_media/pitch.jpg';

test('a focus point is kept on the URL and read back', () => {
  const url = withFocus(PHOTO, { x: 40, y: 15 });
  expect(url).toBe(`${PHOTO}#focus=40,15`);
  expect(getFocus(url)).toEqual({ x: 40, y: 15 });
  expect(focusPosition(url)).toBe('40% 15%');
  expect(stripFocus(url)).toBe(PHOTO);
});

test('the centre is the default, so it is stored as a plain URL', () => {
  expect(withFocus(`${PHOTO}#focus=10,10`, DEFAULT_FOCUS)).toBe(PHOTO);
  expect(getFocus(PHOTO)).toBeNull();
  expect(focusPosition(PHOTO)).toBe('50% 50%');
});

test('values are clamped to 0–100 and rounded', () => {
  expect(withFocus(PHOTO, { x: 120.4, y: -3 })).toBe(`${PHOTO}#focus=100,0`);
  expect(focusPosition({ x: 33.6, y: 66.4 })).toBe('34% 66%');
});

test('loading the file never includes the focus fragment', () => {
  const url = withFocus(PHOTO, { x: 40, y: 15 });
  expect(sizedImageUrl(url, 1080)).toBe('https://res.cloudinary.com/demo/image/upload/c_limit,w_1080,q_auto,f_auto/v1/user_media/pitch.jpg');
  const video = 'https://res.cloudinary.com/demo/video/upload/v1/user_media/clip.mov#focus=40,15';
  expect(isVideoMediaUrl(video)).toBe(true);
  expect(isVideoMediaUrl(url)).toBe(false);
  expect(normalizeMediaVideoUrl(video)).toBe('https://res.cloudinary.com/demo/video/upload/f_mp4,vc_h264/v1/user_media/clip.mp4');
});
