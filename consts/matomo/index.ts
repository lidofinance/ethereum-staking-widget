export * from './matomo-click-events';
export * from './matomo-tx-events';
export * from './matomo-wallets-events';
export * from './matomo-input-events';
export * from './matomo-fetch-events';
export * from './matomo-earn-events';

import {
  MATOMO_CLICK_EVENTS,
  MATOMO_CLICK_EVENTS_TYPES,
} from './matomo-click-events';
import { MATOMO_TX_EVENTS, MATOMO_TX_EVENTS_TYPES } from './matomo-tx-events';
import {
  MATOMO_INPUT_EVENTS,
  MATOMO_INPUT_EVENTS_TYPES,
} from './matomo-input-events';
import {
  MATOMO_FETCH_EVENTS,
  MATOMO_FETCH_EVENTS_TYPES,
} from './matomo-fetch-events';
import {
  MATOMO_EARN_EVENTS,
  MATOMO_EARN_EVENTS_TYPES,
} from './matomo-earn-events';

export const MATOMO_EVENTS = {
  ...MATOMO_CLICK_EVENTS,
  ...MATOMO_TX_EVENTS,
  ...MATOMO_INPUT_EVENTS,
  ...MATOMO_FETCH_EVENTS,
  ...MATOMO_EARN_EVENTS,
};
export type MATOMO_EVENT_TYPE =
  | MATOMO_CLICK_EVENTS_TYPES
  | MATOMO_TX_EVENTS_TYPES
  | MATOMO_INPUT_EVENTS_TYPES
  | MATOMO_FETCH_EVENTS_TYPES
  | MATOMO_EARN_EVENTS_TYPES;
