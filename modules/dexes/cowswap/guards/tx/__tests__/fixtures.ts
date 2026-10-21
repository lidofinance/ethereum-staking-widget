import { mainnet, sepolia } from 'viem/chains';

import invariant from 'tiny-invariant';

import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import sepoliaNetwork from 'networks/sepolia.json';

import { COWSWAP_NETWORKS } from '../../../networks';
import {
  createCowswapProfile,
  type CowswapProfileConfig,
} from '../../../profile';

export const TEST_APP_CODE = 'Lido dApp Staking';

export const TEST_SEPOLIA_NETWORK = {
  ...COWSWAP_NETWORKS[sepolia.id],
  partnerFeeRecipient: sepoliaNetwork.contracts.daoAgent,
};

// Mirrors the withdrawals DEX profile
export const TEST_PROFILE_CONFIG: CowswapProfileConfig = {
  appCode: TEST_APP_CODE,
  sellTokens: [
    { key: 'lido', decimals: 18, oracleFeed: 'STETH_USD' },
    { key: 'wsteth', decimals: 18, oracleFeed: 'WSTETH_USD' },
  ],
  buyTokens: [
    { key: 'eth', decimals: 18, oracleFeed: 'ETH_USD' },
    { key: 'weth', decimals: 18, oracleFeed: 'ETH_USD' },
    { key: 'usdc', decimals: 6, oracleFeed: 'USDC_USD' },
    { key: 'usdt', decimals: 6, oracleFeed: 'USDT_USD' },
    { key: 'usds', decimals: 18, oracleFeed: 'DAI_USD' },
    { key: 'wbtc', decimals: 8, oracleFeed: 'BTC_USD' },
  ],
  defaultPair: { sell: ['lido'], buy: ['eth'] },
  tokenLists: {
    sell: { url: 'https://example.com/sell.json', fallback: 'sell.json' },
    buy: { url: 'https://example.com/buy.json', fallback: 'buy.json' },
  },
  networks: {
    [mainnet.id]: COWSWAP_NETWORKS[mainnet.id],
    // sepolia is off in config, enabled here to cover a second network
    [sepolia.id]: TEST_SEPOLIA_NETWORK,
  },
  analytics: {
    quoteViewed: MATOMO_TX_EVENTS_TYPES.withdrawalDexQuoteViewed,
    quoteError: MATOMO_TX_EVENTS_TYPES.withdrawalDexQuoteError,
    swapStart: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapStart,
    swapPosted: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapPosted,
    swapFinish: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapFinish,
    swapCancel: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapCancel,
  },
};

export const TEST_PROFILE = createCowswapProfile(TEST_PROFILE_CONFIG);

const txConfig = (chainId: number) => {
  const config = TEST_PROFILE.getNetworkTxConfig(chainId);
  invariant(config, `no CoW Swap test config for chain ${chainId}`);
  return config;
};

export const MAINNET_TX_CONFIG = txConfig(mainnet.id);
export const SEPOLIA_TX_CONFIG = txConfig(sepolia.id);
