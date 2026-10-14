import { getNetworkConfigMapByChain, type NetworkConfig } from './networks-map';

export const getContractAddress = <T extends keyof NetworkConfig['contracts']>(
  chainId: number,
  contractName: T,
): NetworkConfig['contracts'][T] | undefined => {
  return getNetworkConfigMapByChain(chainId)?.contracts[contractName];
};
