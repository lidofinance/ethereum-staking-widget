import { CHAINS } from './chains';
import { getAggregatorAddress, getAggregatorContractFactory } from 'config';
import { getStaticRpcBatchProvider } from './rpcProviders';
import { providers } from './providers';
import { iterateUrls } from '@lidofinance/rpc';

export const getEthPrice = async (): Promise<number> => {
  const urls = providers[CHAINS.Mainnet];
  return iterateUrls(urls, (url) => getEthPriceWithFallbacks(url));
};

const getEthPriceWithFallbacks = async (url: string): Promise<number> => {
  const address = getAggregatorAddress(CHAINS.Mainnet);
  const chainId = CHAINS.Mainnet;
  const staticProvider = getStaticRpcBatchProvider(chainId, url);

  const contractFactory = getAggregatorContractFactory();
  const contract = contractFactory.connect(address, staticProvider);

  // TODO: maybe without Promise.all
  const [decimals, latestAnswer] = await Promise.all([
    contract.decimals(),
    contract.latestAnswer(),
  ]);

  return latestAnswer.toNumber() / 10 ** decimals;
};
