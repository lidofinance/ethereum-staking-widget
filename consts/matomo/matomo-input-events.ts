import { MatomoEventType } from '@lidofinance/analytics-matomo';

export const enum MATOMO_INPUT_EVENTS_TYPES {
  ethRewardsEnterAddressManually = 'ethRewardsEnterAddressManually',
  ethRewardsEnterAddressAuto = 'ethRewardsEnterAddressAuto',
  ethRewardsEnterAddressFromQuery = 'ethRewardsEnterAddressFromQuery',
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
};
