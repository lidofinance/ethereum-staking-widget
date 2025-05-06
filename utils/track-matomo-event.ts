import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_EVENTS, MATOMO_EVENT_TYPE } from 'consts/matomo';

export const trackMatomoEvent = (eventType: MATOMO_EVENT_TYPE) => {
  trackEvent(...MATOMO_EVENTS[eventType]);
};
