// src/components/PixelRouteTracker.jsx
// Sends a Meta/TikTok page view on every in-app route change (GA4 handles its own).
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/pixels';

export const PixelRouteTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => { trackPageView(); }, [pathname]);
  return null;
};
