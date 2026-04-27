import { trackEvent } from '@lidofinance/analytics-matomo';
import type {
  ReefKnotConfig,
  ReefKnotWalletsModalConfig,
} from 'reef-knot/types';
import type { WalletIdsEthereum } from 'reef-knot/wallets';
import { MATOMO_CLICK_EVENTS } from './matomo-click-events';

type MetricProps = Pick<
  ReefKnotWalletsModalConfig<WalletIdsEthereum>,
  | 'onClickTermsAccept'
  | 'onClickWalletsMore'
  | 'onClickWalletsLess'
  | 'onConnectStart'
  | 'onConnectSuccess'
> &
  Pick<ReefKnotConfig, 'onAutoConnect' | 'onReconnect'>;

type EventsData = Partial<Record<WalletIdsEthereum, [string, string]>>;

const EVENTS_DATA_CONNECT_START: EventsData = {
  ambire: ['on Ambire', 'ambire'],
  bitget: ['BitGet', 'bitget'],
  browserExtension: ['Browser', 'browser'],
  coinbaseSmartWallet: ['Coinbase Smart Wallet', 'coinbase_smart_wallet'],
  imToken: ['imToken', 'imtoken'],
  ledgerHID: ['Ledger', 'ledger'],
  metaMask: ['Metamask', 'metamask'],
  okx: ['OKX', 'okx'],
  walletConnect: ['WalletConnect', 'walletconnect'],
} as const;

const EVENTS_DATA_CONNECT_SUCCESS: EventsData = {
  ...EVENTS_DATA_CONNECT_START,
  ambire: ['Ambire', 'ambire'],
};

export const walletMetricProps: MetricProps = {
  onClickWalletsLess: () =>
    trackEvent(...MATOMO_CLICK_EVENTS.clickShowLessWallets),

  onClickWalletsMore: () =>
    trackEvent(...MATOMO_CLICK_EVENTS.clickShowMoreWallets),

  onConnectStart: ({ walletId }) => {
    const eventData = EVENTS_DATA_CONNECT_START[walletId];
    if (eventData) {
      trackEvent(
        'Ethereum_Staking_Widget_Selecting_wallet_to_connect',
        `Click ${eventData[0]} wallet`,
        `eth_widget_click_${eventData[1]}`,
      );
    }
  },

  onConnectSuccess: ({ walletId }) => {
    const eventData = EVENTS_DATA_CONNECT_SUCCESS[walletId];
    if (eventData) {
      trackEvent(
        'Ethereum_Staking_Widget',
        `Connect ${eventData[0]}`,
        `eth_widget_connect_${eventData[1]}`,
      );
      trackEvent(
        'Ethereum_Staking_Widget',
        'Wallet is connected',
        'eth_widget_wallet_connected',
      );
    }
  },

  onAutoConnect: () => {
    trackEvent(
      'Ethereum_Staking_Widget',
      'Wallet is auto-connected',
      'eth_widget_wallet_autoconnected',
    );
  },
  onReconnect: () => {
    trackEvent(
      'Ethereum_Staking_Widget',
      'Wallet is reconnected',
      'eth_widget_wallet_reconnected',
    );
  },
};
