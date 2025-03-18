import {
  LIDO_L2_CONTRACT_ADDRESSES,
  SUPPORTED_CHAINS as SDK_SUPPORTED_CHAINS,
} from '@lidofinance/lido-ethereum-sdk/common';

export enum CHAINS {
  Mainnet = 1,
  Holesky = 17000,
  Hoodi = 560048,
  Sepolia = 11155111,
  Optimism = 10,
  OptimismSepolia = 11155420,
  Soneium = 1868,
  SoneiumMinato = 1946,
  Unichain = 130,
  UnichainSepolia = 1301,
}

export enum LIDO_MULTICHAIN_CHAINS {
  'zkSync Era' = 324,
  Optimism = 10,
  Arbitrum = 42161,
  'Polygon PoS' = 137,
  Base = 8453,
  Mantle = 5000,
  Linea = 59144,
  Scroll = 534352,
  'BNB Chain' = 56,
  'Mode Chain' = 34443,
  'Zircuit Chain' = 48900,
  Unichain = 130,
  Metis = 1088,
  Soneium = 1868,
  Lisk = 1135,
}

// TODO: move to @lidofinance/lido-ethereum-sdk package
export const isSDKSupportedL2Chain = (chainId?: CHAINS) => {
  return Boolean(chainId && LIDO_L2_CONTRACT_ADDRESSES[chainId]);
};

export const isSDKSupportedChain = (chainId?: CHAINS) => {
  return Boolean(chainId && SDK_SUPPORTED_CHAINS.includes(chainId));
};
