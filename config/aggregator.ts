import { CHAINS } from '@lido-sdk/constants';
import { AggregatorAbi__factory } from 'generated';

export const AGGREGATOR_BY_NETWORK: {
  [key in CHAINS]: string;
} = {
  [CHAINS.Mainnet]: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  [CHAINS.Ropsten]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Rinkeby]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Goerli]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Kovan]: '0x0000000000000000000000000000000000000000',
};

export const getAggregatorAddress = (chainId: CHAINS): string => {
  return AGGREGATOR_BY_NETWORK[chainId];
};

export type ContractAggregator = typeof AggregatorAbi__factory;

export const getAggregatorContractFactory = (): ContractAggregator => {
  return AggregatorAbi__factory;
};
