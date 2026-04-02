import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LEADSOS_URL = 'https://leads.adhello.ai';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch(`${LEADSOS_URL}/api/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: location.pathname + location.search,
            referrer: document.referrer || 'direct',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        });
      } catch (err) {
        // Silently fail analytics so it doesn't break user experience
        console.warn('[ANALYTICS] Tracking failed:', err);
      }
    };

    trackVisit();
  }, [location]);
};
