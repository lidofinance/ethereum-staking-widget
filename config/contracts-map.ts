import type { Address } from 'viem';
import getConfigNext from 'next/config';
const { publicRuntimeConfig, serverRuntimeConfig } = getConfigNext();

// should be in camelCase
import holeskyContracts from 'contracts/holesky.json';
import hoodiContracts from 'contracts/hoodi.json';
import mainnetContracts from 'contracts/mainnet.json';
import sepoliaContracts from 'contracts/sepolia.json';

export type ContractAddresses = {
  // TODO: not all available
  LIDO_LOCATOR: Address;
  AGGREGATOR_STETH_USD_PRICE_FEED: Address;
  LIDO_CURVE_LIQUIDITY_FARMING_POOL: Address;
  STAKING_ROUTER: Address;
  WITHDRAWAL_QUEUE: Address;
  STETH: Address;
  WSTETH: Address;
  LDO: Address;
  ENS_PUBLIC_RESOLVER: Address;
};

export const HOLESKY = 'holesky';
export const HOODI = 'hoodi';
export const MAINNET = 'mainnet';
export const SEPOLIA = 'sepolia';

// current contracts set label
export const CONTRACTS_SET_LABEL =
  serverRuntimeConfig.contractsSet || publicRuntimeConfig.contractsSet;

// export contracts from all environments
export const CONTRACTS_MAP = {
  holesky: holeskyContracts as ContractAddresses,
  hoodi: hoodiContracts as ContractAddresses,
  mainnet: mainnetContracts as ContractAddresses,
  sepolia: sepoliaContracts as ContractAddresses,
} as Record<string, ContractAddresses>;

export const getContractsByLabel = (label: string) => {
  switch (label) {
    case HOLESKY:
      return holeskyContracts as ContractAddresses;
    case HOODI:
      return hoodiContracts as ContractAddresses;
    case SEPOLIA:
      return sepoliaContracts as ContractAddresses;
    // MAINNET:
    default:
      return mainnetContracts as ContractAddresses;
  }
};
