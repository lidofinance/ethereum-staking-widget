import type { Address } from 'viem';
import getConfigNext from 'next/config';
const { publicRuntimeConfig, serverRuntimeConfig } = getConfigNext();

import { CHAINS } from 'consts/chains';

import holeskyContracts from 'contracts/holesky.json';
import hoodiContracts from 'contracts/hoodi.json';
import mainnetContracts from 'contracts/mainnet.json';
import sepoliaContracts from 'contracts/sepolia.json';
import sepoliaPublicDevnetContracts from 'contracts/sepolia-public-devnet.json';

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

export const SEPOLIA_PUBLIC_DEVNET = 'SEPOLIA_PUBLIC_DEVNET';

// current contracts set label
export const CONTRACTS_SET_LABEL =
  serverRuntimeConfig.contractsSet || publicRuntimeConfig.contractsSet;

// export contracts from all environments
export const CONTRACTS_MAP = {
  [CHAINS.Mainnet]: mainnetContracts as ContractAddresses,
  [CHAINS.Holesky]: holeskyContracts as ContractAddresses,
  [CHAINS.Hoodi]: hoodiContracts as ContractAddresses,
  [CHAINS.Sepolia]: sepoliaContracts as ContractAddresses,
  [SEPOLIA_PUBLIC_DEVNET]: sepoliaPublicDevnetContracts as ContractAddresses,
} as Record<string, ContractAddresses>;

export type ChainLabel = keyof typeof CHAINS | typeof SEPOLIA_PUBLIC_DEVNET;

export const getContractsByLabel = (label: ChainLabel): ContractAddresses =>
  CONTRACTS_MAP[label] ?? CONTRACTS_MAP[CHAINS.Mainnet];
