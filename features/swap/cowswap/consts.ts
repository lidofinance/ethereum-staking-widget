// import { GITHUB_RAW_MAIN_PATH } from 'consts/external-links';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import {
  COWSWAP_NETWORKS,
  createCowswapProfile,
  type CowswapToken,
} from 'modules/dexes/cowswap';

// Any-to-any: every token is listed on both sides; ETH is sold through EthFlow
const SWAP_TOKENS: CowswapToken[] = [
  { key: 'eth', decimals: 18, oracleFeed: 'ETH_USD' },
  { key: 'lido', decimals: 18, oracleFeed: 'STETH_USD' },
  // wstETH is priced as stETH × stEthPerToken
  { key: 'wsteth', decimals: 18, oracleFeed: 'WSTETH_USD' },
  { key: 'ldo', decimals: 18, oracleFeed: 'LDO_USD' },
  { key: 'weth', decimals: 18, oracleFeed: 'ETH_USD' },
  { key: 'usdc', decimals: 6, oracleFeed: 'USDC_USD' },
  { key: 'usdt', decimals: 6, oracleFeed: 'USDT_USD' },
  { key: 'usde', decimals: 18, oracleFeed: 'USDE_USD' },
  { key: 'dai', decimals: 18, oracleFeed: 'DAI_USD' },
  { key: 'usds', decimals: 18, oracleFeed: 'USDS_USD' },
  { key: 'pyusd', decimals: 6, oracleFeed: 'PYUSD_USD' },
  { key: 'wbtc', decimals: 8, oracleFeed: 'WBTC_USD' },
  { key: 'cbbtc', decimals: 8, oracleFeed: 'CBBTC_USD' },
  { key: 'rlusd', decimals: 18, oracleFeed: 'RLUSD_USD' },
  { key: 'usdg', decimals: 6, oracleFeed: 'USDG_USD' },
  { key: 'link', decimals: 18, oracleFeed: 'LINK_USD' },
  { key: 'uni', decimals: 18, oracleFeed: 'UNI_USD' },
  { key: 'aave', decimals: 18, oracleFeed: 'AAVE_USD' },
  { key: 'ausd', decimals: 6, oracleFeed: 'AUSD_USD' },
  { key: 'eurc', decimals: 6, oracleFeed: 'EURC_USD' },
  { key: 'gho', decimals: 18, oracleFeed: 'GHO_USD' },
  { key: 'paxg', decimals: 18, oracleFeed: 'PAXG_USD' },
  { key: 'tbtc', decimals: 18, oracleFeed: 'TBTC_USD' },
  { key: 'lbtc', decimals: 8, oracleFeed: 'LBTC_USD' },
  { key: 'cbeth', decimals: 18, oracleFeed: 'CBETH_USD' },
  { key: 'susde', decimals: 18, oracleFeed: 'SUSDE_USD' },
];

export const SWAP_COWSWAP_PROFILE = createCowswapProfile({
  appCode: 'Lido dApp Swap',
  sellTokens: SWAP_TOKENS,
  buyTokens: SWAP_TOKENS,
  // stETH is mainnet-only, L2s start from wstETH
  defaultPair: { sell: ['lido', 'wsteth'], buy: ['eth'] },
  tokenLists: {
    sell: {
      // TODO: temp
      url: 'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/feature/si-2786-new-navigation/public/token-lists/swap-dex-sell-tokenlist.json',
      fallback: 'token-lists/swap-dex-sell-tokenlist.json',
    },
    buy: {
      // TODO: temp
      url: 'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/feature/si-2786-new-navigation/public/token-lists/swap-dex-buy-tokenlist.json',
      fallback: 'token-lists/swap-dex-buy-tokenlist.json',
    },
  },
  // every network with CoW contracts and a partner fee recipient
  networks: COWSWAP_NETWORKS,
  analytics: {
    quoteViewed: MATOMO_TX_EVENTS_TYPES.withdrawalDexQuoteViewed,
    quoteError: MATOMO_TX_EVENTS_TYPES.withdrawalDexQuoteError,
    swapStart: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapStart,
    swapPosted: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapPosted,
    swapFinish: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapFinish,
    swapCancel: MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapCancel,
  },
});
