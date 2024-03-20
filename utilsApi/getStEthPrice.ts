import { iterateUrls } from '@lidofinance/rpc';
import { CHAINS } from '@lido-sdk/constants';
import { getAggregatorContract } from '@lido-sdk/contracts';

import { getAggregatorStEthUsdPriceFeedAddress } from 'consts/aggregator';

import { getStaticRpcBatchProvider } from './rpcProviders';
import { rpcUrls } from './rpcUrls';

export const getStEthPrice = async (): Promise<number> => {
  const urls = rpcUrls[CHAINS.Mainnet];
  return iterateUrls(
    urls,
    (url) => getStEthPriceWithFallbacks(url),
    console.error,
  );
};

const getStEthPriceWithFallbacks = async (url: string): Promise<number> => {
  const address = getAggregatorStEthUsdPriceFeedAddress(CHAINS.Mainnet);
  const staticProvider = getStaticRpcBatchProvider(CHAINS.Mainnet, url);

  const contract = getAggregatorContract(address, staticProvider);

  const [decimals, latestAnswer] = await Promise.all([
    contract.decimals(),
    contract.latestAnswer(),
  ]);

  return latestAnswer.toNumber() / 10 ** decimals;
};
