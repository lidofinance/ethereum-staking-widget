import { MatomoEvent } from 'utils';

const enum EVENTS {
  connectWallet = 'connectWallet',
  submitStake = 'submitStake',
  submitWrap = 'submitWrap',
  submitUnwrap = 'submitUnwrap',
  calculateRewards = 'calculateRewards',
}

export const MATOMO_EVENTS: Record<EVENTS, MatomoEvent> = {
  connectWallet: [
    'Stake_page',
    'Push "Connect wallet" button',
    'eth_widget_connect_wallet',
  ],
  submitStake: ['Stake_page', 'Push submit button', 'eth_widget_stake_eth'],
  submitWrap: ['Wrap_page', 'Push "Wrap" button', 'eth_widget_wrap_eth'],
  submitUnwrap: ['Wrap_page', 'Push "Unwrap button"', 'eth_widget_unwrap_eth'],
  // rewards history
  calculateRewards: [
    'Rewards_page',
    'Push calculate reward button" ',
    'eth_widget_calculate reward',
  ],
};
