import { callMatomo } from '@lidofinance/analytics-matomo';
import { MATOMO_TX_EVENTS, MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import { logMatomoEventForQA } from 'features/qa-debug/matomo-log';

import { weiToEth } from './weiToEth';

export const trackWithdrawalFinishEvent = (amount: bigint): void => {
  const [category, action, name] =
    MATOMO_TX_EVENTS[MATOMO_TX_EVENTS_TYPES.withdrawalRequestFinish];

  logMatomoEventForQA(MATOMO_TX_EVENTS_TYPES.withdrawalRequestFinish, [
    category,
    action,
    name,
    weiToEth(amount),
  ]);

  callMatomo('trackEvent', category, action, name, weiToEth(amount));
};
