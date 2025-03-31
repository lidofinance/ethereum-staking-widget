import type { Address } from 'viem';
import invariant from 'tiny-invariant';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';

import { CONTRACTS_MAP } from 'config';

export const AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK: {
  [key in CHAINS]?: Address;
} = {
  [CHAINS.Mainnet]: CONTRACTS_MAP.mainnet.AGGREGATOR_STETH_USD_PRICE_FEED,
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
