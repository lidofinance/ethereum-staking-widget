import { callMatomo } from '@lidofinance/analytics-matomo';
import { MATOMO_TX_EVENTS } from 'consts/matomo';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import { weiToEth } from './weiToEth';

export const trackWithdrawalFinishEvent = (amount: bigint): void => {
  const [category, action, name] =
    MATOMO_TX_EVENTS[MATOMO_TX_EVENTS_TYPES.withdrawalRequestFinish];
  callMatomo('trackEvent', category, action, name, weiToEth(amount));
};
