import { MatomoEventType, trackEvent } from '@lidofinance/analytics-matomo';
import { Metrics as WalletsMetrics } from 'reef-knot/connect-wallet-modal';

export const enum MATOMO_WALLETS_EVENTS_TYPES {
  onClickAmbire = 'onClickAmbire',
  onConnectAmbire = 'onConnectAmbire',
  onClickBlockchaincom = 'onClickBlockchaincom',
  onConnectBlockchaincom = 'onConnectBlockchaincom',
  onClickBrave = 'onClickBrave',
  onConnectBrave = 'onConnectBrave',
  onClickCoin98 = 'onClickCoin98',
  onConnectCoin98 = 'onConnectCoin98',
  onClickCoinbase = 'onClickCoinbase',
  onConnectCoinbase = 'onConnectCoinbase',
  onClickExodus = 'onClickExodus',
  onConnectExodus = 'onConnectExodus',
  onClickGamestop = 'onClickGamestop',
  onConnectGamestop = 'onConnectGamestop',
  onClickImToken = 'onClickImToken',
  onConnectImToken = 'onConnectImToken',
  onClickLedger = 'onClickLedger',
  onConnectLedger = 'onConnectLedger',
  onClickMathWallet = 'onClickMathWallet',
  onConnectMathWallet = 'onConnectMathWallet',
  onClickMetamask = 'onClickMetamask',
  onConnectMetamask = 'onConnectMetamask',
  onClickOperaWallet = 'onClickOperaWallet',
  onConnectOperaWallet = 'onConnectOperaWallet',
  onClickTally = 'onClickTally',
  onConnectTally = 'onConnectTally',
  onClickTrust = 'onClickTrust',
  onConnectTrust = 'onConnectTrust',
  onClickWC = 'onClickWC',
  onConnectWC = 'onConnectWC',
  onClickXdefi = 'onClickXdefi',
  onConnectXdefi = 'onConnectXdefi',
  onClickZenGo = 'onClickZenGo',
  onConnectZenGo = 'onConnectZenGo',
  onClickZerion = 'onClickZerion',
  onConnectZerion = 'onConnectZerion',
  onClickOkx = 'onClickOkx',
  onConnectOkx = 'onConnectOkx',
  onClickPhantom = 'onClickPhantom',
  onConnectPhantom = 'onConnectPhantom',
  onClickBitkeep = 'onClickBitkeep',
  onConnectBitkeep = 'onConnectBitkeep',
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
  [MATOMO_WALLETS_EVENTS_TYPES.onClickBlockchaincom]: [
    'Ethereum_Staking_Widget',
    'Click Blockchain.com wallet',
    'eth_widget_click_blockchaincom',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectBlockchaincom]: [
    'Ethereum_Staking_Widget',
    'Connect Blockchain.com wallet',
    'eth_widget_connect_blockchaincom',
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
  [MATOMO_WALLETS_EVENTS_TYPES.onClickGamestop]: [
    'Ethereum_Staking_Widget',
    'Click Gamestop wallet',
    'eth_widget_click_gamestop',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectGamestop]: [
    'Ethereum_Staking_Widget',
    'Connect Gamestop wallet',
    'eth_widget_connect_gamestop',
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
  [MATOMO_WALLETS_EVENTS_TYPES.onClickMathWallet]: [
    'Ethereum_Staking_Widget',
    'Click MathWallet wallet',
    'eth_widget_click_mathwallet',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectMathWallet]: [
    'Ethereum_Staking_Widget',
    'Connect MathWallet wallet',
    'eth_widget_connect_mathwallet',
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
  [MATOMO_WALLETS_EVENTS_TYPES.onClickOperaWallet]: [
    'Ethereum_Staking_Widget',
    'Click Opera wallet',
    'eth_widget_click_opera',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectOperaWallet]: [
    'Ethereum_Staking_Widget',
    'Connect Opera wallet',
    'eth_widget_connect_opera',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickTally]: [
    'Ethereum_Staking_Widget',
    'Click Tally wallet',
    'eth_widget_click_tally',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectTally]: [
    'Ethereum_Staking_Widget',
    'Connect Tally wallet',
    'eth_widget_connect_tally',
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
  [MATOMO_WALLETS_EVENTS_TYPES.onClickZenGo]: [
    'Ethereum_Staking_Widget',
    'Click ZenGo wallet',
    'eth_widget_click_zengo',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectZenGo]: [
    'Ethereum_Staking_Widget',
    'Connect ZenGo wallet',
    'eth_widget_connect_zengo',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickZerion]: [
    'Ethereum_Staking_Widget',
    'Click Zerion wallet',
    'eth_widget_click_zerion',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectZerion]: [
    'Ethereum_Staking_Widget',
    'Connect Zerion wallet',
    'eth_widget_connect_zerion',
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
  [MATOMO_WALLETS_EVENTS_TYPES.onClickPhantom]: [
    'Ethereum_Staking_Widget',
    'Click Phantom wallet',
    'eth_widget_click_phantom',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectPhantom]: [
    'Ethereum_Staking_Widget',
    'Connect Phantom wallet',
    'eth_widget_connect_phantom',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onClickBitkeep]: [
    'Ethereum_Staking_Widget',
    'Click BitKeep wallet',
    'eth_widget_click_bitkeep',
  ],
  [MATOMO_WALLETS_EVENTS_TYPES.onConnectBitkeep]: [
    'Ethereum_Staking_Widget',
    'Connect BitKeep wallet',
    'eth_widget_connect_bitkeep',
  ],
};

export const walletsMetrics: WalletsMetrics = {
  events: {
    click: {
      handlers: {
        onClickAmbire: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickAmbire);
        },
        onClickBlockchaincom: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickBlockchaincom);
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
        onClickGamestop: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickGamestop);
        },
        onClickImToken: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickImToken);
        },
        onClickLedger: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickLedger);
        },
        onClickMathWallet: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickMathWallet);
        },
        onClickMetamask: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickMetamask);
        },
        onClickOperaWallet: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickOperaWallet);
        },
        onClickTally: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickTally);
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
        onClickZenGo: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickZenGo);
        },
        onClickZerion: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickZerion);
        },
        onClickOkx: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickOkx);
        },
        onClickPhantom: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickPhantom);
        },
        onClickBitkeep: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onClickBitkeep);
        },
      },
    },
    connect: {
      handlers: {
        onConnectAmbire: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectAmbire);
        },
        onConnectBlockchaincom: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectBlockchaincom);
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
        onConnectGamestop: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectGamestop);
        },
        onConnectImToken: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectImToken);
        },
        onConnectLedger: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectLedger);
        },
        onConnectMathWallet: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectMathWallet);
        },
        onConnectMetamask: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectMetamask);
        },
        onConnectOperaWallet: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectOperaWallet);
        },
        onConnectTally: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectTally);
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
        onConnectZenGo: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectZenGo);
        },
        onConnectZerion: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectZerion);
        },
        onConnectOkx: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectOkx);
        },
        onConnectPhantom: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectPhantom);
        },
        onConnectBitkeep: () => {
          trackEvent(...MATOMO_WALLETS_EVENTS.onConnectBitkeep);
        },
      },
    },
  },
};
