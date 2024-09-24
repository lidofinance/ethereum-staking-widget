export enum CHAINS {
  Mainnet = 1,
  Holesky = 17000,
  Sepolia = 11155111,
  OptimismSepolia = 11155420,
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
}

// TODO: move to legacy lido-js-sdk package
export const SDK_LEGACY_SUPPORTED_CHAINS = [
  CHAINS.Mainnet,
  CHAINS.Holesky,
  CHAINS.Sepolia,
];

// TODO: move to @lidofinance/lido-ethereum-sdk package
export const SDK_SUPPORTED_MULTICHAIN_CHAINS = [CHAINS.OptimismSepolia];

// TODO: move to @lidofinance/lido-ethereum-sdk package
export const isSDKSupportedL2Chain = (chainId: CHAINS) => {
  return SDK_SUPPORTED_MULTICHAIN_CHAINS.indexOf(chainId) > -1;
};
