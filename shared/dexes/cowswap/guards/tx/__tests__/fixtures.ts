import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';

import { buildNetworkTxConfig } from '../utils/network-tx-config';
import type { ContactsMap } from '../utils/types';

// Same token keys as the withdrawals DEX integration
export const SELL_TOKEN_KEYS = ['lido', 'wsteth'] as const;
export const BUY_TOKEN_KEYS = ['weth', 'usdc', 'usdt', 'usds', 'wbtc'] as const;
export const DEX_TOKEN_KEYS = [...SELL_TOKEN_KEYS, ...BUY_TOKEN_KEYS] as const;

export const MAINNET_TX_CONFIG = buildNetworkTxConfig(
  mainnetNetwork.contracts,
  DEX_TOKEN_KEYS,
  SELL_TOKEN_KEYS,
  BUY_TOKEN_KEYS,
);

export const SEPOLIA_TX_CONFIG = buildNetworkTxConfig(
  sepoliaNetwork.contracts as ContactsMap,
  DEX_TOKEN_KEYS,
  SELL_TOKEN_KEYS,
  BUY_TOKEN_KEYS,
);
