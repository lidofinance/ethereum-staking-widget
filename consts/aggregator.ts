import { CHAINS } from '@lido-sdk/constants';
import invariant from 'tiny-invariant';

// https://etherscan.io/address/0xcfe54b5cd566ab89272946f602d76ea879cab4a8
export const AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK: {
  [key in CHAINS]?: string;
} = {
  [CHAINS.Mainnet]: '0xcfe54b5cd566ab89272946f602d76ea879cab4a8',
};

// Chainlink: STETH/USD Price Feed
// https://data.chain.link/ethereum/mainnet/crypto-usd/steth-usd
export const getAggregatorStEthUsdPriceFeedAddress = (
  chainId: CHAINS,
): string => {
  const address = AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK[chainId];
  invariant(address, 'chain is not supported');
  return address;
};
