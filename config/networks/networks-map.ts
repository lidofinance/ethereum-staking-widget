import type { Address } from 'viem';
import invariant from 'tiny-invariant';
import getConfigNext from 'next/config';
const { publicRuntimeConfig, serverRuntimeConfig } = getConfigNext();

import { CHAINS } from '@lidofinance/lido-ethereum-sdk';

import { isSDKSupportedChainAndChainIsL1 } from 'consts/chains';

import holeskySet from 'networks/holesky.json' assert { type: 'json' };
import hoodiSet from 'networks/hoodi.json' assert { type: 'json' };
import mainnetSet from 'networks/mainnet.json' assert { type: 'json' };
import sepoliaSet from 'networks/sepolia.json' assert { type: 'json' };
import sepoliaPublicDevnetSet from 'networks/sepolia-public-devnet.json' assert { type: 'json' };
import hoodiPublicDevnetsSet from 'networks/hoodi-public-devnet.json' assert { type: 'json' };

export const API_NAMES = {};

export const CONTRACT_NAMES = {
  lido: 'lido',
  steth: 'steth', // lido is same
  wsteth: 'wsteth',
  ldo: 'ldo',
  L2stETH: 'L2stETH',
  L2wstETH: 'L2wstETH',
  withdrawalQueue: 'withdrawalQueue',
  aggregator: 'aggregator',
  aggregatorStEthUsdPriceFeed: 'aggregatorStEthUsdPriceFeed',
  stakingRouter: 'stakingRouter',
  stethCurve: 'stethCurve',
  lidoLocator: 'lidoLocator',
  ensPublicResolver: 'ensPublicResolver',
  ensRegistry: 'ensRegistry',
} as const;
export type CONTRACT_NAMES = keyof typeof CONTRACT_NAMES;

export type NetworkConfig = {
  api: {
    [K in keyof typeof API_NAMES]: string;
  };
  contracts: {
    [K in keyof typeof CONTRACT_NAMES]: Address;
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

export const getNetworkConfigMapByChain = (chain: CHAINS): NetworkConfig => {
  const overridedSetName = DEVNET_OVERRIDES[chain];

  const networkConfigMap = overridedSetName
    ? DEVNETS_MAP[overridedSetName]
    : NETWORKS_MAP[chain];

  // invariant can only work on L1
  isSDKSupportedChainAndChainIsL1(chain) &&
    invariant(
      networkConfigMap,
      `Network config not found for L1 chainId: ${chain}`,
    );

  return networkConfigMap;
};
