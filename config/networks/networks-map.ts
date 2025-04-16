import type { Address } from 'viem';
import invariant from 'tiny-invariant';
import getConfigNext from 'next/config';

const { serverRuntimeConfig } = getConfigNext();

import {
  CHAINS,
  LIDO_L2_CONTRACT_ADDRESSES,
} from '@lidofinance/lido-ethereum-sdk/common';

// Main deployments
import mainnetSet from 'networks/mainnet.json' assert { type: 'json' };
import hoodiSet from 'networks/hoodi.json' assert { type: 'json' };
import sepoliaSet from 'networks/sepolia.json' assert { type: 'json' };
import holeskySet from 'networks/holesky.json' assert { type: 'json' };

// Devnet deployments
import hoodiDevnet0Set from 'networks/hoodi-devnet-0.json' assert { type: 'json' };
import { getPreConfig } from 'config/get-preconfig';

// For future overrides of APIs in devnets
export const API_NAMES = {};

export const CONTRACT_NAMES = {
  lido: 'lido',
  wsteth: 'wsteth',
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
    [K in keyof typeof API_NAMES]?: string;
  };
  contracts: {
    [K in keyof typeof CONTRACT_NAMES]?: Address;
  };
};

const DEVNET_OVERRIDES: Record<number, string> = // Merge client&server values
  (serverRuntimeConfig.devnetOverrides || getPreConfig().devnetOverrides || '')
    .split(',')
    .reduce(
      (acc, override) => {
        const [chainId, setName] = override.split(':');
        if (!isNaN(Number(chainId)) && setName) {
          acc[Number(chainId)] = setName;
        }
        return acc;
      },
      {} as Record<number, string>,
    );

const NETWORKS_MAP = {
  [CHAINS.Mainnet]: mainnetSet as NetworkConfig,
  [CHAINS.Holesky]: holeskySet as NetworkConfig,
  [CHAINS.Hoodi]: hoodiSet as NetworkConfig,
  [CHAINS.Sepolia]: sepoliaSet as NetworkConfig,
} as Record<string, NetworkConfig>;

const DEVNETS_MAP = {
  // keys MUST be like in the `DEVNET_OVERRIDES` env
  'hoodi-devnet-0': hoodiDevnet0Set as NetworkConfig,
} as Record<string, NetworkConfig>;

export const getNetworkConfigMapByChain = (
  chain: CHAINS,
): NetworkConfig | undefined => {
  const overridedSetName = DEVNET_OVERRIDES[chain];

  if (overridedSetName) {
    invariant(
      overridedSetName in DEVNETS_MAP,
      `DEVNETS_MAP doesn't contain the override set "${overridedSetName}" for chainId: ${chain}`,
    );
    return DEVNETS_MAP[overridedSetName];
  }

  if (LIDO_L2_CONTRACT_ADDRESSES[chain]) {
    return {
      api: {},
      contracts: {
        [CONTRACT_NAMES.L2stETH]: LIDO_L2_CONTRACT_ADDRESSES[chain]?.[
          'steth'
        ] as Address,
        [CONTRACT_NAMES.L2wstETH]: LIDO_L2_CONTRACT_ADDRESSES[chain]?.[
          'wsteth'
        ] as Address,
      },
    } as NetworkConfig;
  }

  return NETWORKS_MAP[chain];
};
