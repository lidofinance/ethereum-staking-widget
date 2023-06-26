import { CHAINS } from 'utils/chains';

export const getBackendRPCPath = (chainId: string | number): string => {
  const BASE_URL = typeof window === 'undefined' ? '' : window.location.origin;
  return `${BASE_URL}/api/rpc?chainId=${chainId}`;
};

export const backendRPC = {
  [CHAINS.Mainnet]: getBackendRPCPath(CHAINS.Mainnet),
  [CHAINS.Goerli]: getBackendRPCPath(CHAINS.Goerli),
};
