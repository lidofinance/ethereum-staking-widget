import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
import {
  getContractsMapByChain,
  type ContractAddresses,
} from './contracts-map';

export const getContractAddress = <T extends keyof ContractAddresses>(
  chainId: CHAINS,
  contractName: T,
): ContractAddresses[T] | undefined => {
  return getContractsMapByChain(chainId)?.[contractName];
};
