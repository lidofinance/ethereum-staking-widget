import { MatomoEvent } from 'utils';

const enum EVENTS {
  connectWallet = 'connectWallet',
  submitStake = 'submitStake',
  submitWrap = 'submitWrap',
  submitUnwrap = 'submitUnwrap',
  calculateRewards = 'calculateRewards',
  oneInchDiscount = 'oneInchDiscount',
}

export const MATOMO_EVENTS: Record<EVENTS, MatomoEvent> = {
  connectWallet: [
    'Ethereum_Stacking_Widget',
    'Push "Connect wallet" button',
    'eth_widget_connect_wallet',
  ],
  submitStake: [
    'Ethereum_Stacking_Widget',
    'Push submit button',
    'eth_widget_stake_eth',
  ],
  submitWrap: [
    'Ethereum_Stacking_Widget',
    'Push "Wrap" button',
    'eth_widget_wrap_eth',
  ],
  submitUnwrap: [
    'Ethereum_Stacking_Widget',
    'Push "Unwrap button"',
    'eth_widget_unwrap_eth',
  ],
  oneInchDiscount: [
    'Ethereum_Stacking_Widget',
    'Push "Get discount" on 1inch template on widget',
    // TODO: add event name
    '',
  ],
  // rewards history
  calculateRewards: [
    'Ethereum_Stacking_Widget',
    'Push calculate reward button" ',
    'eth_widget_calculate reward',
  ],
};
