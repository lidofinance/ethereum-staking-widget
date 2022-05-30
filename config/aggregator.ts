import { CHAINS } from '@lido-sdk/constants';
import { AggregatorAbi__factory } from 'generated';

// Chainlink: ETH/USD Price Feed
// https://data.chain.link/ethereum/mainnet/crypto-usd/eth-usd
// https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
// DERECATED in future. Get from https://github.com/lidofinance/lido-js-sdk/blob/cd47110a0fa346d8ff699dc900694fdc588584a7/packages/constants/src/aggregator.ts
export const AGGREGATOR_BY_NETWORK: {
  [key in CHAINS]: string;
} = {
  [CHAINS.Mainnet]: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  [CHAINS.Ropsten]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Rinkeby]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Goerli]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Kovan]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Kintsugi]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Kiln]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Moonbeam]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Moonriver]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Moonbase]: '0x0000000000000000000000000000000000000000',
};

export const getAggregatorAddress = (chainId: CHAINS): string => {
  return AGGREGATOR_BY_NETWORK[chainId];
};

// Chainlink: STETH/USD Price Feed
// https://data.chain.link/ethereum/mainnet/crypto-usd/steth-usd
// https://etherscan.io/address/0xcfe54b5cd566ab89272946f602d76ea879cab4a8
// TODO: move to lido-js-sdk
export const AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK: {
  [key in CHAINS]: string;
} = {
  [CHAINS.Mainnet]: '0xcfe54b5cd566ab89272946f602d76ea879cab4a8',
  [CHAINS.Ropsten]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Rinkeby]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Goerli]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Kovan]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Kintsugi]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Kiln]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Moonbeam]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Moonriver]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Moonbase]: '0x0000000000000000000000000000000000000000',
};

export const getAggregatorStEthUsdPriceFeedAddress = (
  chainId: CHAINS,
): string => {
  return AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK[chainId];
};

export type ContractAggregator = typeof AggregatorAbi__factory;

export const getAggregatorContractFactory = (): ContractAggregator => {
  return AggregatorAbi__factory;
};
