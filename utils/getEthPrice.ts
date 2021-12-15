import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  getAggregatorAddress,
  getAggregatorContractFactory,
  getRpcJsonUrls,
  HEALTHY_RPC_SERVICES_ARE_OVER,
} from 'config';

export const getEthPrice = async (): Promise<number> => {
  const urls = getRpcJsonUrls(CHAINS.Mainnet);
  return getEthPriceWithFallbacks(urls, 0);
};

const getEthPriceWithFallbacks = async (
  urls: Array<string>,
  urlIndex: number,
): Promise<number> => {
  try {
    const address = getAggregatorAddress(CHAINS.Mainnet);
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
      console.log('[getEthPrice] Get via infura');
    }
    if (urls[urlIndex].indexOf('alchemy') > -1) {
      console.log('[getEthPrice] Get via alchemy');
    }

    return latestAnswer.toNumber() / 10 ** decimals;
  } catch (error) {
    if (urlIndex >= urls.length - 1) {
      const error = `[getEthPrice] ${HEALTHY_RPC_SERVICES_ARE_OVER}`;
      throw new Error(error);
    }
  }

  return await getEthPriceWithFallbacks(urls, urlIndex + 1);
};
