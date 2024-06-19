import { MatomoEventType, trackEvent } from '@lidofinance/analytics-matomo';
import { Metrics as WalletsMetrics } from 'reef-knot/connect-wallet-modal';

export const enum MATOMO_WALLETS_EVENTS_TYPES {
  onClickAmbire = 'onClickAmbire',
  onConnectAmbire = 'onConnectAmbire',
  onClickBrave = 'onClickBrave',
  onConnectBrave = 'onConnectBrave',
  onClickCoin98 = 'onClickCoin98',
  onConnectCoin98 = 'onConnectCoin98',
  onClickCoinbase = 'onClickCoinbase',
  onConnectCoinbase = 'onConnectCoinbase',
  onClickExodus = 'onClickExodus',
  onConnectExodus = 'onConnectExodus',
  onClickImToken = 'onClickImToken',
  onConnectImToken = 'onConnectImToken',
  onClickLedger = 'onClickLedger',
  onConnectLedger = 'onConnectLedger',
  onClickMetamask = 'onClickMetamask',
  onConnectMetamask = 'onConnectMetamask',
  onClickTrust = 'onClickTrust',
  onConnectTrust = 'onConnectTrust',
  onClickWC = 'onClickWC',
  onConnectWC = 'onConnectWC',
  onClickXdefi = 'onClickXdefi',
  onConnectXdefi = 'onConnectXdefi',
  onClickOkx = 'onClickOkx',
  onConnectOkx = 'onConnectOkx',
  onClickBitget = 'onClickBitget',
  onConnectBitget = 'onConnectBitget',
}

export const MATOMO_WALLETS_EVENTS: Record<
  MATOMO_WALLETS_EVENTS_TYPES,
  MatomoEventType
> = {
  [MATOMO_WALLETS_EVENTS_TYPES.onClickAmbire]: [
    'Ethereum_Staking_Widget',
    'Click on Ambire wallet',
    'eth_widget_click_ambire',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectAmbire]: [
    'Ethereum_Staking_Widget',
    'Connect Ambire wallet',
    'eth_widget_connect_ambire',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickBrave]: [
    'Ethereum_Staking_Widget',
    'Click Brave wallet',
    'eth_widget_click_brave',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectBrave]: [
    'Ethereum_Staking_Widget',
    'Connect Brave wallet',
    'eth_widget_connect_brave',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickCoin98]: [
    'Ethereum_Staking_Widget',
    'Click Coin98 wallet',
    'eth_widget_click_coin98',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectCoin98]: [
    'Ethereum_Staking_Widget',
    'Connect Coin98 wallet',
    'eth_widget_connect_coin98',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickCoinbase]: [
    'Ethereum_Staking_Widget',
    'Click Coinbase Wallet wallet',
    'eth_widget_click_coinbase_wallet',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectCoinbase]: [
    'Ethereum_Staking_Widget',
    'Connect Coinbase Wallet wallet',
    'eth_widget_connect_coinbase_wallet',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickExodus]: [
    'Ethereum_Staking_Widget',
    'Click Exodus wallet',
    'eth_widget_click_exodus',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectExodus]: [
    'Ethereum_Staking_Widget',
    'Connect Exodus wallet',
    'eth_widget_connect_exodus',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickImToken]: [
    'Ethereum_Staking_Widget',
    'Click imToken wallet',
    'eth_widget_click_imtoken',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectImToken]: [
    'Ethereum_Staking_Widget',
    'Connect imToken wallet',
    'eth_widget_connect_imtoken',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickLedger]: [
    'Ethereum_Staking_Widget',
    'Click Ledger wallet',
    'eth_widget_click_ledger',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectLedger]: [
    'Ethereum_Staking_Widget',
    'Connect Ledger wallet',
    'eth_widget_connect_ledger',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickMetamask]: [
    'Ethereum_Staking_Widget',
    'Click Metamask wallet',
    'eth_widget_click_metamask',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectMetamask]: [
    'Ethereum_Staking_Widget',
    'Connect Metamask wallet',
    'eth_widget_connect_metamask',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickTrust]: [
    'Ethereum_Staking_Widget',
    'Click Trust wallet',
    'eth_widget_click_trust',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectTrust]: [
    'Ethereum_Staking_Widget',
    'Connect Trust wallet',
    'eth_widget_connect_trust',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickWC]: [
    'Ethereum_Staking_Widget',
    'Click WalletConnect wallet',
    'eth_widget_click_walletconnect',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectWC]: [
    'Ethereum_Staking_Widget',
    'Connect WalletConnect wallet',
    'eth_widget_connect_walletconnect',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickXdefi]: [
    'Ethereum_Staking_Widget',
    'Click XDEFI wallet',
    'eth_widget_click_xdefi',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectXdefi]: [
    'Ethereum_Staking_Widget',
    'Connect XDEFI wallet',
    'eth_widget_connect_xdefi',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickOkx]: [
    'Ethereum_Staking_Widget',
    'Click OKX wallet',
    'eth_widget_click_okx',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectOkx]: [
    'Ethereum_Staking_Widget',
    'Connect OKX wallet',
    'eth_widget_connect_okx',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickBitget]: [
    'Ethereum_Staking_Widget',
    'Click BitGet wallet',
    'eth_widget_click_bitget',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectBitget]: [
    'Ethereum_Staking_Widget',
    'Connect BitGet wallet',
    'eth_widget_connect_bitget',
  ],
};

export const walletsMetrics: WalletsMetrics = {
  events: {
    click: {
      handlers: {
        onClickAmbire: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickAmbire);
        },
        onClickBrave: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickBrave);
        },
        onClickCoin98: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickCoin98);
        },
        onClickCoinbase: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickCoinbase);
        },
        onClickExodus: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickExodus);
        },
        onClickImToken: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickImToken);
        },
        onClickLedger: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickLedger);
        },
        onClickMetamask: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickMetamask);
        },
        onClickTrust: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickTrust);
        },
        onClickWalletconnect: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickWC);
        },
        onClickXdefi: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickXdefi);
        },
        onClickOkx: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickOkx);
        },
        onClickBitget: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickBitget);
        },
      },
    },
    connect: {
      handlers: {
        onConnectAmbire: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectAmbire);
        },
        onConnectBrave: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectBrave);
        },
        onConnectCoin98: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectCoin98);
        },
        onConnectCoinbase: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectCoinbase);
        },
        onConnectExodus: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectExodus);
        },
        onConnectImToken: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectImToken);
        },
        onConnectLedger: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectLedger);
        },
        onConnectMetamask: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectMetamask);
        },
        onConnectTrust: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectTrust);
        },
        onConnectWalletconnect: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectWC);
        },
        onConnectXdefi: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectXdefi);
        },
        onConnectOkx: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectOkx);
        },
        onConnectBitget: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectBitget);
        },
      },
    },
  },
};
