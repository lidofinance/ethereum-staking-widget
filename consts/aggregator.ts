import type { Address } from 'viem';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';

import { CONTRACTS_MAP } from 'config/contracts-map';

// Chainlink: STETH/USD Price Feed
// https://data.chain.link/ethereum/mainnet/crypto-usd/steth-usd
export const getAggregatorStEthUsdPriceFeedAddress = (
  chainId: CHAINS,
): Address | undefined => {
  return CONTRACTS_MAP[chainId]?.AGGREGATOR_STETH_USD_PRICE_FEED;
};
