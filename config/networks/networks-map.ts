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
import hoodiDevnet1Set from 'networks/hoodi-devnet-1.json' assert { type: 'json' };
import { getPreConfig } from 'config/get-preconfig';

// For future overrides of APIs in devnets
export const API_NAMES = {};

export const CONTRACT_NAMES = {
  // Main Lido contract
  lido: 'lido',
  wsteth: 'wsteth',
  withdrawalQueue: 'withdrawalQueue',
  // SI
  wstethReferralStaker: 'wstethReferralStaker',
  // DualGovernance
  dualGovernance: 'dualGovernance',
  escrow: 'escrow',
  emergencyProtectedTimelock: 'emergencyProtectedTimelock',
  dgConfigProvider: 'dgConfigProvider',
  // l2 contracts
  L2stETH: 'L2stETH',
  L2wstETH: 'L2wstETH',
  // Aux contracts
  aggregatorEthUsdPriceFeed: 'aggregatorEthUsdPriceFeed',
  aggregatorStEthUsdPriceFeed: 'aggregatorStEthUsdPriceFeed',
  stakingRouter: 'stakingRouter',
  stethCurve: 'stethCurve',
  lidoLocator: 'lidoLocator',
  ensPublicResolver: 'ensPublicResolver',
  ensRegistry: 'ensRegistry',
  weth: 'weth',
  // GGV
  ggvVault: 'ggvVault',
  ggvTeller: 'ggvTeller',
  ggvAccountant: 'ggvAccountant',
  ggvLens: 'ggvLens',
  ggvQueue: 'ggvQueue',
  // DVV
  dvvVault: 'dvvVault',
  dvvDepositWrapper: 'dvvDepositWrapper',
  // stRATEGY
  stgVault: 'stgVault',
  stgDepositQueueETH: 'stgDepositQueueETH',
  stgDepositQueueWETH: 'stgDepositQueueWETH',
  stgDepositQueueWSTETH: 'stgDepositQueueWSTETH',
  stgRedeemQueueWSTETH: 'stgRedeemQueueWSTETH',
  stgShareManagerSTRETH: 'stgShareManagerSTRETH',
  stgCollector: 'stgCollector',
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

// For now stub L2 deployments,
// as we don't need L2 devnets and it's easier to add more L2s
const L2_NETWORK_MAP: Record<string, NetworkConfig> = Object.entries(
  LIDO_L2_CONTRACT_ADDRESSES,
).reduce(
  (acc, [chainId, { wsteth, steth }]) => {
    acc[chainId] = {
      api: {},
      contracts: {
        [CONTRACT_NAMES.L2stETH]: steth,
        [CONTRACT_NAMES.L2wstETH]: wsteth,
      },
    } as NetworkConfig;
    return acc;
  },
  {} as Record<string, NetworkConfig>,
);

const NETWORKS_MAP = {
  ...L2_NETWORK_MAP,
  [CHAINS.Mainnet]: mainnetSet as NetworkConfig,
  [CHAINS.Holesky]: holeskySet as NetworkConfig,
  [CHAINS.Hoodi]: hoodiSet as NetworkConfig,
  [CHAINS.Sepolia]: sepoliaSet as NetworkConfig,
} as Record<string, NetworkConfig>;

// keys MUST correlate with the `DEVNET_OVERRIDES` env
const DEVNETS_MAP = {
  // TODO: remove
  'hoodi-devnet-0': hoodiDevnet0Set as NetworkConfig,
  'hoodi-devnet-1': hoodiDevnet1Set as NetworkConfig,
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

  return NETWORKS_MAP[chain];
};
