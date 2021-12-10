import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  getAggregatorStEthUsdPriceFeedAddress,
  getAggregatorContractFactory,
  getRpcJsonUrls,
} from 'config';

export const getStEthPrice = async (): Promise<number> => {
  const urls = getRpcJsonUrls(CHAINS.Mainnet);
  return getStEthPriceWithFallbacks(urls, 0);
};

const getStEthPriceWithFallbacks = async (
  urls: Array<string>,
  urlIndex: number,
): Promise<number> => {
  // TODO: remove api-key from log
  // console.log('[getStEthPrice] Try get via', urls[urlIndex]);
  console.log('[getStEthPrice] Try get urlIndex: ', urlIndex);

  try {
    const address = getAggregatorStEthUsdPriceFeedAddress(CHAINS.Mainnet);
    const staticProvider = getStaticRpcBatchProvider(
      CHAINS.Mainnet,
      urls[urlIndex],
    );

    const contractFactory = getAggregatorContractFactory();
    const contract = contractFactory.connect(address, staticProvider);

    const [decimals, latestAnswer] = await Promise.all([
      contract.decimals(),
      contract.latestAnswer(),
    ]);

    return latestAnswer.toNumber() / 10 ** decimals;
  } catch (error) {
    if (urlIndex >= urls.length - 1) {
      console.log('Healthy RPC services are over! Throw error');
      throw error;
    }
  }

  return await getStEthPriceWithFallbacks(urls, urlIndex + 1);
};
