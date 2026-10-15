import { mainnet, sepolia } from 'viem/chains';

// import { GITHUB_RAW_MAIN_PATH } from 'consts/external-links';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import {
  createCowswapProfile,
  type ContactsMap,
  type CowswapToken,
} from 'shared/dexes/cowswap';
import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

// Any-to-any: every ERC-20 is listed on both sides; native ETH is buy-only
const SWAP_TOKENS: CowswapToken[] = [
  { key: 'lido', decimals: 18, oracleFeed: 'STETH_USD' },
  // wstETH is converted to stETH via stEthPerToken
  { key: 'wsteth', decimals: 18, oracleFeed: 'STETH_USD' },
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
];

export const SWAP_COWSWAP_PROFILE = createCowswapProfile({
  appCode: 'Lido dApp Swap',
  sellTokens: SWAP_TOKENS,
  buyTokens: [
    { key: 'eth', decimals: 18, oracleFeed: 'ETH_USD' },
    ...SWAP_TOKENS,
  ],
  defaultPair: { sell: 'STETH', buy: 'ETH' },
  tokenLists: {
    sell: {
      // TODO: temp
      url: 'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/feature/si-2790-swap-tab/public/token-lists/swap-dex-sell-tokenlist.json',
      fallback: 'token-lists/swap-dex-sell-tokenlist.json',
    },
    buy: {
      // TODO: temp
      url: 'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/feature/si-2790-swap-tab/public/token-lists/swap-dex-buy-tokenlist.json',
      fallback: 'token-lists/swap-dex-buy-tokenlist.json',
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
