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
  Unichain = 130,
  UnichainSepolia = 1301,
}

export enum LIDO_MULTICHAIN_CHAINS {
  Optimism = 10,
  Arbitrum = 42161,
  Base = 8453,
  Linea = 59144,
  'BNB Chain' = 56,
  Unichain = 130,
  Metis = 1088,
}

// TODO: move to @lidofinance/lido-ethereum-sdk package

export const isSDKSupportedChain = (chainId?: CHAINS) => {
  return Boolean(chainId && SDK_SUPPORTED_CHAINS.includes(chainId));
};

export const isSDKSupportedL2Chain = (chainId?: CHAINS) => {
  return Boolean(chainId && LIDO_L2_CONTRACT_ADDRESSES[chainId]);
};

export const isSDKSupportedChainAndChainIsL1 = (chainId?: CHAINS) => {
  return Boolean(
    chainId && isSDKSupportedChain(chainId) && !isSDKSupportedL2Chain(chainId),
  );
};
