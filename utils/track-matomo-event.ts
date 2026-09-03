import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_EVENTS, MATOMO_EVENT_TYPE } from 'consts/matomo';
import { logMatomoEventForQA } from 'features/qa-debug/matomo-log';

export const trackMatomoEvent = (eventType: MATOMO_EVENT_TYPE) => {
  logMatomoEventForQA(eventType, MATOMO_EVENTS[eventType]);

  trackEvent(...MATOMO_EVENTS[eventType]);
};
