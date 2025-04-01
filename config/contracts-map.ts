import type { Address } from 'viem';
import getConfigNext from 'next/config';
const { publicRuntimeConfig, serverRuntimeConfig } = getConfigNext();

import { CHAINS } from 'consts/chains';

import holeskyContracts from 'contracts/holesky.json' assert { type: 'json' };
import hoodiContracts from 'contracts/hoodi.json' assert { type: 'json' };
import mainnetContracts from 'contracts/mainnet.json' assert { type: 'json' };
import sepoliaContracts from 'contracts/sepolia.json' assert { type: 'json' };
import sepoliaPublicDevnetContracts from 'contracts/sepolia-public-devnet.json' assert { type: 'json' };
import hoodiPublicDevnetContracts from 'contracts/hoodi-public-devnet.json' assert { type: 'json' };

export type ContractAddresses = {
  // TODO: not all available
  LIDO_LOCATOR: Address;
  AGGREGATOR_STETH_USD_PRICE_FEED: Address;
  LIDO_CURVE_LIQUIDITY_FARMING_POOL: Address;
  STAKING_ROUTER: Address;
  WITHDRAWAL_QUEUE: Address;
  stETH: Address;
  wstETH: Address;
  LDO: Address;
  ENS_PUBLIC_RESOLVER: Address;
};

export const CONTRACTS_OVERRIDES_BY_CHAIN =
  serverRuntimeConfig.contractsOverridesByChain ||
  publicRuntimeConfig.contractsOverridesByChain;

// export contracts from all environments
export const CONTRACTS_MAP = {
  [CHAINS.Mainnet]: mainnetContracts as ContractAddresses,
  [CHAINS.Holesky]: holeskyContracts as ContractAddresses,
  [CHAINS.Hoodi]: hoodiContracts as ContractAddresses,
  [CHAINS.Sepolia]: sepoliaContracts as ContractAddresses,
} as Record<string, ContractAddresses>;

export const OVERRIDE_CONTRACTS_MAP = {
  'devnet-1': sepoliaPublicDevnetContracts,
  'devnet-n': hoodiPublicDevnetContracts,
} as Record<string, ContractAddresses>;

export const getContractsMapByChain = (chain: CHAINS): ContractAddresses => {
  const overrideSet = CONTRACTS_OVERRIDES_BY_CHAIN[chain];
  if (overrideSet && OVERRIDE_CONTRACTS_MAP[overrideSet]) {
    return OVERRIDE_CONTRACTS_MAP[overrideSet];
  }

  return CONTRACTS_MAP[chain] ?? CONTRACTS_MAP[CHAINS.Mainnet];
};
