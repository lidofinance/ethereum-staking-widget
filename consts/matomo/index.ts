export * from './matomo-click-events';
export * from './matomo-tx-events';
export * from './matomo-wallets-events';
export * from './matomo-input-events';

import {
  MATOMO_CLICK_EVENTS,
  MATOMO_CLICK_EVENTS_TYPES,
} from './matomo-click-events';
import { MATOMO_TX_EVENTS, MATOMO_TX_EVENTS_TYPES } from './matomo-tx-events';
import {
  MATOMO_INPUT_EVENTS,
  MATOMO_INPUT_EVENTS_TYPES,
} from './matomo-input-events';

export const MATOMO_EVENTS = {
  ...MATOMO_CLICK_EVENTS,
  ...MATOMO_TX_EVENTS,
  ...MATOMO_INPUT_EVENTS,
};
export type MATOMO_EVENT_TYPE =
  | MATOMO_CLICK_EVENTS_TYPES
  | MATOMO_TX_EVENTS_TYPES
  | MATOMO_INPUT_EVENTS_TYPES;
