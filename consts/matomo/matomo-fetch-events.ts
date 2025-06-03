import { MatomoEventType } from '@lidofinance/analytics-matomo';

export const enum MATOMO_FETCH_EVENTS_TYPES {
  ethRewardsDashboardDownloaded = 'ethRewardsDashboardDownloaded',
}

export const MATOMO_FETCH_EVENTS: Record<
  MATOMO_FETCH_EVENTS_TYPES,
  MatomoEventType
> = {
  [MATOMO_FETCH_EVENTS_TYPES.ethRewardsDashboardDownloaded]: [
    'Ethereum_Rewards_Widget',
    'Rewards dashboard is downloaded',
    'eth_rewards_rewards_dashboard_downloaded',
  ],
};
