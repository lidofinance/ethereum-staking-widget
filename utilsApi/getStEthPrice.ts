import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  getAggregatorStEthUsdPriceFeedAddress,
  getAggregatorContractFactory,
  getRpcJsonUrls,
  HEALTHY_RPC_SERVICES_ARE_OVER,
} from 'config';
import { serverLogger } from 'utilsApi';

export const getStEthPrice = async (): Promise<number> => {
  const urls = getRpcJsonUrls(CHAINS.Mainnet);
  return getStEthPriceWithFallbacks(urls, 0);
};

const getStEthPriceWithFallbacks = async (
  urls: Array<string>,
  urlIndex: number,
): Promise<number> => {
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

    // TODO: metrics
    if (urls[urlIndex].indexOf('infura') > -1) {
      serverLogger.log('[getStEthPrice] Get via infura');
    }
    if (urls[urlIndex].indexOf('alchemy') > -1) {
      serverLogger.log('[getStEthPrice] Get via alchemy');
    }

    return latestAnswer.toNumber() / 10 ** decimals;
  } catch {
    if (urlIndex >= urls.length - 1) {
      const error = `[getStEthPrice] ${HEALTHY_RPC_SERVICES_ARE_OVER}`;
      serverLogger.error(error);
      throw new Error(error);
    }
    return await getStEthPriceWithFallbacks(urls, urlIndex + 1);
  }
};
