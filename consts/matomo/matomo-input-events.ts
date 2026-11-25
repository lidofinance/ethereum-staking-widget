import { MatomoEventType } from '@lidofinance/analytics-matomo';

export const enum MATOMO_INPUT_EVENTS_TYPES {
  ethRewardsEnterAddressManually = 'ethRewardsEnterAddressManually',
  ethRewardsEnterAddressAuto = 'ethRewardsEnterAddressAuto',
  // chain and token go as custom dimensions
  stakingMoreLiquidity = 'stakingMoreLiquidity',
  // chain goes as a custom dimension and as the numeric value, 0 on disconnect
  walletChainChanged = 'walletChainChanged',
}

export const MATOMO_INPUT_EVENTS: Record<
  MATOMO_INPUT_EVENTS_TYPES,
  MatomoEventType
> = {
  [MATOMO_INPUT_EVENTS_TYPES.ethRewardsEnterAddressManually]: [
    'Ethereum_Rewards_Widget',
    'Enter wallet address to the input manually',
    'eth_widget_enter_address_manually',
  ],
  [MATOMO_INPUT_EVENTS_TYPES.ethRewardsEnterAddressAuto]: [
    'Ethereum_Rewards_Widget',
    'Auto-entering the wallet address',
    'eth_widget_enter_address_auto',
  ],

  [MATOMO_INPUT_EVENTS_TYPES.stakingMoreLiquidity]: [
    'Ethereum_Staking_Widget',
    'Direct Staking user may want more liquidity',
    'eth_widget_staking_whale',
  ],
  [MATOMO_INPUT_EVENTS_TYPES.walletChainChanged]: [
    'Ethereum_Staking_Widget',
    'Wallet chain changed',
    'eth_widget_wallet_chain_changed',
  ],
};
