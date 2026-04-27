import { callMatomo } from '@lidofinance/analytics-matomo';
import { MATOMO_TX_EVENTS, MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';

import { overrideWithQAMockBoolean } from './qa';
import { weiToEth } from './weiToEth';

export const trackWithdrawalFinishEvent = (amount: bigint): void => {
  const enableLogging = overrideWithQAMockBoolean(
    false,
    'mock-qa-helpers-matomo-logging',
  );
  const [category, action, name] =
    MATOMO_TX_EVENTS[MATOMO_TX_EVENTS_TYPES.withdrawalRequestFinish];

  if (enableLogging) {
    console.info(
      '%cTracking Matomo event:',
      'background:#3152A0;color:#fff;padding:2px 4px;border-radius:2px',
      [category, action, name, weiToEth(amount)].join(', '),
    );
  }

  callMatomo('trackEvent', category, action, name, weiToEth(amount));
};
