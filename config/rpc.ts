import getConfig from 'next/config';
import { CHAINS } from 'utils/chains';

const { serverRuntimeConfig } = getConfig();
const { basePath } = serverRuntimeConfig;

export const getBackendRPCPath = (chainId: string | number): string => {
  return `${basePath ?? ''}/api/rpc?chainId=${chainId}`;
};

export const backendRPC = {
  [CHAINS.Mainnet]: getBackendRPCPath(CHAINS.Mainnet),
  [CHAINS.Goerli]: getBackendRPCPath(CHAINS.Goerli),
};
