import { mainnet, sepolia } from 'viem/chains';

import { GITHUB_RAW_MAIN_PATH } from 'consts/external-links';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import { createCowswapProfile, type ContactsMap } from 'shared/dexes/cowswap';
import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

export const SWAP_COWSWAP_PROFILE = createCowswapProfile({
  appCode: 'Lido Staking Widget - test',
  sellTokens: [
    { key: 'lido', decimals: 18, oracleFeed: 'STETH_USD' },
    // wstETH is converted to stETH via stEthPerToken
    { key: 'wsteth', decimals: 18, oracleFeed: 'STETH_USD' },
  ],
  buyTokens: [
    { key: 'eth', decimals: 18, oracleFeed: 'ETH_USD' },
    { key: 'weth', decimals: 18, oracleFeed: 'ETH_USD' },
    { key: 'usdc', decimals: 6, oracleFeed: 'USDC_USD' },
    { key: 'usdt', decimals: 6, oracleFeed: 'USDT_USD' },
    // USDS priced via DAI/USD
    { key: 'usds', decimals: 18, oracleFeed: 'DAI_USD' },
    { key: 'wbtc', decimals: 8, oracleFeed: 'BTC_USD' },
  ],
  defaultPair: { sell: 'STETH', buy: 'ETH' },
  tokenLists: {
    sell: {
      url: `${GITHUB_RAW_MAIN_PATH}/public/token-lists/withdrawals-dex-sell-tokenlist.json`,
      fallback: 'token-lists/withdrawals-dex-sell-tokenlist.json',
    },
    buy: {
      url: `${GITHUB_RAW_MAIN_PATH}/public/token-lists/withdrawals-dex-buy-tokenlist.json`,
      fallback: 'token-lists/withdrawals-dex-buy-tokenlist.json',
    },
  },
  networks: {
    [mainnet.id]: mainnetNetwork.contracts,
    // Most tokens are missing on Sepolia, so validation is partial and support for this testnet is limited
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
});
