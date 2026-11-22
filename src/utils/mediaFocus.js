// src/utils/mediaFocus.js
//
// Focus point for post photos. Photos are shown cropped (object-fit: cover), so each photo can
// carry the point that should stay in view, chosen by its author. The point travels with the
// photo's URL as a fragment, e.g. ".../photo.jpg#focus=50,20" (x and y in percent). Browsers and
// Cloudinary never send the fragment to the server, so the image itself loads exactly as before,
// and no backend change is needed: the URL is stored in mediaUrls like any other.

const FOCUS_RE = /#focus=(\d{1,3}(?:\.\d+)?),(\d{1,3}(?:\.\d+)?)$/;

export const DEFAULT_FOCUS = Object.freeze({ x: 50, y: 50 });

const clamp = (n) => Math.min(100, Math.max(0, Math.round(Number(n) || 0)));

/** The focus point stored on a media URL, or null if it has none. */
export const getFocus = (url) => {
  const match = typeof url === 'string' ? url.match(FOCUS_RE) : null;
  return match ? { x: clamp(match[1]), y: clamp(match[2]) } : null;
};

/** The URL without its focus fragment, for loading the file itself. */
export const stripFocus = (url) => (typeof url === 'string' ? url.replace(FOCUS_RE, '') : url);

/** The URL carrying this focus point. The centre is the default, so it is stored as a plain URL. */
export const withFocus = (url, focus) => {
  const base = stripFocus(url);
  if (!base || !focus) return base;
  const x = clamp(focus.x);
  const y = clamp(focus.y);
  if (x === DEFAULT_FOCUS.x && y === DEFAULT_FOCUS.y) return base;
  return `${base}#focus=${x},${y}`;
};

/** CSS object-position for a media URL (or a focus object). */
export const focusPosition = (urlOrFocus) => {
  const focus = (typeof urlOrFocus === 'string' ? getFocus(urlOrFocus) : urlOrFocus) || DEFAULT_FOCUS;
  return `${clamp(focus.x)}% ${clamp(focus.y)}%`;
};

export const isVideoMediaUrl = (url) => {
  const plain = stripFocus(url || '');
  return /\.(mp4|mov|webm|m4v)$/i.test(plain) || plain.includes('/video/upload/');
};
