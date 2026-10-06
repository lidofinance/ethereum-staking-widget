import { MatomoEventType } from '@lidofinance/analytics-matomo';

export const enum MATOMO_INPUT_EVENTS_TYPES {
  ethRewardsEnterAddressManually = 'ethRewardsEnterAddressManually',
  ethRewardsEnterAddressAuto = 'ethRewardsEnterAddressAuto',
  stakeL2MoreLiquidityBase = 'stakeL2MoreLiquidityBase',
  stakeL2MoreLiquidityArbitrum = 'stakeL2MoreLiquidityArbitrum',
  stakeL2MoreLiquidityOptimism = 'stakeL2MoreLiquidityOptimism',
  stakeL2MoreLiquidityLinea = 'stakeL2MoreLiquidityLinea',
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

  [MATOMO_INPUT_EVENTS_TYPES.stakeL2MoreLiquidityBase]: [
    'Ethereum_Staking_Widget',
    'Direct Staking on Base user may want more liquidity',
    'eth_widget_staking_on_Base_whale',
  ],
  [MATOMO_INPUT_EVENTS_TYPES.stakeL2MoreLiquidityArbitrum]: [
    'Ethereum_Staking_Widget',
    'Direct Staking on Arbitrum user may want more liquidity',
    'eth_widget_staking_on_Arbitrum_whale',
  ],
  [MATOMO_INPUT_EVENTS_TYPES.stakeL2MoreLiquidityOptimism]: [
    'Ethereum_Staking_Widget',
    'Direct Staking on Optimism user may want more liquidity',
    'eth_widget_staking_on_Optimism_whale',
  ],
  [MATOMO_INPUT_EVENTS_TYPES.stakeL2MoreLiquidityLinea]: [
    'Ethereum_Staking_Widget',
    'Direct Staking on Linea user may want more liquidity',
    'eth_widget_staking_on_Linea_whale',
  ],
};
