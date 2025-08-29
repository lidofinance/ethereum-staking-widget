import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';
import { getNetworkConfigMapByChain, type NetworkConfig } from './networks-map';

export const getContractAddress = <T extends keyof NetworkConfig['contracts']>(
  chainId: CHAINS,
  contractName: T,
): NetworkConfig['contracts'][T] | undefined => {
  return getNetworkConfigMapByChain(chainId)?.contracts[contractName];
};
