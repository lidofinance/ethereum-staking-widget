import type { Address } from 'viem';
import getConfigNext from 'next/config';
const { publicRuntimeConfig, serverRuntimeConfig } = getConfigNext();

import { CHAINS } from '@lidofinance/lido-ethereum-sdk';

import holeskySet from 'networks/holesky.json' assert { type: 'json' };
import hoodiSet from 'networks/hoodi.json' assert { type: 'json' };
import mainnetSet from 'networks/mainnet.json' assert { type: 'json' };
import sepoliaSet from 'networks/sepolia.json' assert { type: 'json' };
import sepoliaPublicDevnetSet from 'networks/sepolia-public-devnet.json' assert { type: 'json' };
import hoodiPublicDevnetsSet from 'networks/hoodi-public-devnet.json' assert { type: 'json' };

export const API_KEYS = {};

export const CONTRACT_KEYS = {
  LIDO_LOCATOR: 'LIDO_LOCATOR',
  AGGREGATOR_STETH_USD_PRICE_FEED: 'AGGREGATOR_STETH_USD_PRICE_FEED',
  LIDO_CURVE_LIQUIDITY_FARMING_POOL: 'LIDO_CURVE_LIQUIDITY_FARMING_POOL',
  STAKING_ROUTER: 'STAKING_ROUTER',
  WITHDRAWAL_QUEUE: 'WITHDRAWAL_QUEUE',
  stETH: 'stETH',
  wstETH: 'wstETH',
  LDO: 'LDO',
  ENS_PUBLIC_RESOLVER: 'ENS_PUBLIC_RESOLVER',
} as const;

export type NetworkConfig = {
  api: {
    [K in keyof typeof API_KEYS]: string;
  };
  contracts: {
    [K in keyof typeof CONTRACT_KEYS]: Address;
  };
};

export const DEVNET_OVERRIDES =
  serverRuntimeConfig.devnetOverrides || publicRuntimeConfig.devnetOverrides;

// export contracts for main chains (without devnets)
export const NETWORKS_MAP = {
  [CHAINS.Mainnet]: mainnetSet as NetworkConfig,
  [CHAINS.Holesky]: holeskySet as NetworkConfig,
  [CHAINS.Hoodi]: hoodiSet as NetworkConfig,
  [CHAINS.Sepolia]: sepoliaSet as NetworkConfig,
} as Record<string, NetworkConfig>;

export const DEVNETS_MAP = {
  // keys MUST be like in the `DEVNET_OVERRIDES` env
  'sepolia-public-devnet': sepoliaPublicDevnetSet as NetworkConfig,
  'hoodi-public-devnet': hoodiPublicDevnetsSet as NetworkConfig,
} as Record<string, NetworkConfig>;

export const getNetworkConfigMapByChain = (
  chain: CHAINS,
): NetworkConfig | undefined => {
  const overridedSetName = DEVNET_OVERRIDES[chain];
  return overridedSetName ? DEVNETS_MAP[overridedSetName] : NETWORKS_MAP[chain];
};
