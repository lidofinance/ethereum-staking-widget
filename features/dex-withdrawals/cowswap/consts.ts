import { sepolia } from 'viem/chains';

import { GITHUB_RAW_MAIN_PATH } from 'consts/external-links';
import {
  buildNetworkTxConfig,
  NetworkTxConfig,
} from 'shared/dexes/cowswap/guards/tx/utils';
import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

type ContactsMap = typeof mainnetNetwork.contracts;

export const DEX_SELL_TOKEN_LIST_URL = `${GITHUB_RAW_MAIN_PATH}/public/token-lists/withdrawals-dex-sell-tokenlist.json`;
export const DEX_BUY_TOKEN_LIST_URL = `${GITHUB_RAW_MAIN_PATH}/public/token-lists/withdrawals-dex-buy-tokenlist.json`;

export const DEX_SELL_TOKEN_LIST_URL_FALLBACK = `token-lists/withdrawals-dex-sell-tokenlist.json`;
export const DEX_BUY_TOKEN_LIST_URL_FALLBACK = `token-lists/withdrawals-dex-buy-tokenlist.json`;

const SELL_TOKEN_KEYS = ['lido', 'wsteth'] as const;
const BUY_TOKEN_KEYS = ['weth', 'usdc', 'usdt', 'usds', 'wbtc'] as const;
const DEX_TOKEN_KEYS = [...SELL_TOKEN_KEYS, ...BUY_TOKEN_KEYS] as const;

const MAINNET_CONFIG = buildNetworkTxConfig(
  mainnetNetwork.contracts,
  DEX_TOKEN_KEYS,
  SELL_TOKEN_KEYS,
  BUY_TOKEN_KEYS,
);
// Most tokens are missing on Sepolia, so we only validation is partial and support for this testnet is limited
const SEPOLIA_CONFIG = buildNetworkTxConfig(
  sepoliaNetwork.contracts as ContactsMap,
  DEX_TOKEN_KEYS,
  SELL_TOKEN_KEYS,
  BUY_TOKEN_KEYS,
);

export const getNetworkTxConfig = (chainId: number): NetworkTxConfig => {
  if (chainId === sepolia.id) return SEPOLIA_CONFIG;

  return MAINNET_CONFIG;
};
