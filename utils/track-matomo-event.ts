import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_EVENTS, MATOMO_EVENT_TYPE } from 'consts/matomo';
import { overrideWithQAMockBoolean } from './qa';

export const trackMatomoEvent = (eventType: MATOMO_EVENT_TYPE) => {
  const enableLogging = overrideWithQAMockBoolean(
    false,
    'mock-qa-helpers-matomo-logging',
  );
  if (enableLogging) {
    console.info(
      '%cTracking Matomo event:',
      'background:#3152A0;color:#fff;padding:2px 4px;border-radius:2px',
      MATOMO_EVENTS[eventType].join(', '),
    );
  }

  trackEvent(...MATOMO_EVENTS[eventType]);
};
