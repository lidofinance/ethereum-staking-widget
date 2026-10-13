import { mainnet, sepolia } from 'viem/chains';

import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import {
  createCowswapProfile,
  type CowswapProfileConfig,
} from '../../../profile';
import type { ContactsMap } from '../utils/types';

export const TEST_APP_CODE = 'Lido Staking Widget';

// Mirrors the withdrawals DEX profile
export const TEST_PROFILE_CONFIG: CowswapProfileConfig = {
  appCode: TEST_APP_CODE,
  sellTokens: [
    { key: 'lido', decimals: 18, oracleFeed: 'STETH_USD' },
    { key: 'wsteth', decimals: 18, oracleFeed: 'STETH_USD' },
  ],
  buyTokens: [
    { key: 'eth', decimals: 18, oracleFeed: 'ETH_USD' },
    { key: 'weth', decimals: 18, oracleFeed: 'ETH_USD' },
    { key: 'usdc', decimals: 6, oracleFeed: 'USDC_USD' },
    { key: 'usdt', decimals: 6, oracleFeed: 'USDT_USD' },
    { key: 'usds', decimals: 18, oracleFeed: 'DAI_USD' },
    { key: 'wbtc', decimals: 8, oracleFeed: 'BTC_USD' },
  ],
  defaultPair: { sell: 'STETH', buy: 'ETH' },
  tokenLists: {
    sell: { url: 'https://example.com/sell.json', fallback: 'sell.json' },
    buy: { url: 'https://example.com/buy.json', fallback: 'buy.json' },
  },
  networks: {
    [mainnet.id]: mainnetNetwork.contracts,
    [sepolia.id]: sepoliaNetwork.contracts as ContactsMap,
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

export const MAINNET_TX_CONFIG = TEST_PROFILE.getNetworkTxConfig(mainnet.id);
export const SEPOLIA_TX_CONFIG = TEST_PROFILE.getNetworkTxConfig(sepolia.id);
