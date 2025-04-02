import type { Address } from 'viem';
import getConfigNext from 'next/config';
const { publicRuntimeConfig, serverRuntimeConfig } = getConfigNext();

import { CHAINS } from '@lidofinance/lido-ethereum-sdk';

import holeskyContracts from 'contracts/holesky.json' assert { type: 'json' };
import hoodiContracts from 'contracts/hoodi.json' assert { type: 'json' };
import mainnetContracts from 'contracts/mainnet.json' assert { type: 'json' };
import sepoliaContracts from 'contracts/sepolia.json' assert { type: 'json' };
import sepoliaPublicDevnetContracts from 'contracts/sepolia-public-devnet.json' assert { type: 'json' };
import hoodiPublicDevnetContracts from 'contracts/hoodi-public-devnet.json' assert { type: 'json' };

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

export type ContractAddresses = {
  [K in keyof typeof CONTRACT_KEYS]: Address;
};

export const CONTRACTS_OVERRIDES_BY_CHAIN =
  serverRuntimeConfig.contractsOverridesByChain ||
  publicRuntimeConfig.contractsOverridesByChain;

// export contracts for main chains (without devnets)
export const CONTRACTS_MAP = {
  [CHAINS.Mainnet]: mainnetContracts as ContractAddresses,
  [CHAINS.Holesky]: holeskyContracts as ContractAddresses,
  [CHAINS.Hoodi]: hoodiContracts as ContractAddresses,
  [CHAINS.Sepolia]: sepoliaContracts as ContractAddresses,
} as Record<string, ContractAddresses>;

export const OVERRIDE_CONTRACTS_MAP = {
  // keys MUST be like in the `CONTRACTS_OVERRIDES_BY_CHAIN` env
  'devnet-1': sepoliaPublicDevnetContracts,
  'devnet-n': hoodiPublicDevnetContracts,
} as Record<string, ContractAddresses>;

export const getContractsMapByChain = (
  chain: CHAINS,
): ContractAddresses | undefined => {
  const overridedSetName = CONTRACTS_OVERRIDES_BY_CHAIN[chain];
  return overridedSetName
    ? OVERRIDE_CONTRACTS_MAP[overridedSetName]
    : CONTRACTS_MAP[chain];
};
