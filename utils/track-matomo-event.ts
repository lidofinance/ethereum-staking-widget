import { trackEvent } from '@lidofinance/analytics-matomo';
import {
  MATOMO_CLICK_EVENTS_TYPES,
  MATOMO_CLICK_EVENTS,
} from 'consts/matomo-click-events';

export const trackMatomoEvent = (eventType: MATOMO_CLICK_EVENTS_TYPES) => {
  trackEvent(...MATOMO_CLICK_EVENTS[eventType]);
};
