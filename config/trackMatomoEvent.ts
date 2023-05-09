import {
  MATOMO_CLICK_EVENTS_TYPES,
  MATOMO_CLICK_EVENTS,
} from './matomoClickEvents';
import { trackEvent } from '@lidofinance/analytics-matomo';

export { MATOMO_CLICK_EVENTS_TYPES } from './matomoClickEvents';

export const trackMatomoEvent = (eventType: MATOMO_CLICK_EVENTS_TYPES) => {
  trackEvent(...MATOMO_CLICK_EVENTS[eventType]);
};
