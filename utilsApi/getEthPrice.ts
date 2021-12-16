import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  getAggregatorAddress,
  getAggregatorContractFactory,
  getRpcJsonUrls,
  HEALTHY_RPC_SERVICES_ARE_OVER,
} from 'config';
import { rpcResponseTime, INFURA, ALCHEMY } from 'utilsApi/metrics';

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

    const endMetric = rpcResponseTime.startTimer();

    // TODO: maybe without Promise.all
    const [decimals, latestAnswer] = await Promise.all([
      contract.decimals(),
      contract.latestAnswer(),
    ]);

    if (urls[urlIndex].indexOf(INFURA) > -1) {
      console.log('[getEthApr] Get via infura');
      endMetric({ provider: INFURA });
    }
    if (urls[urlIndex].indexOf(ALCHEMY) > -1) {
      console.log('[getEthApr] Get via alchemy');
      endMetric({ provider: ALCHEMY });
    }

    return latestAnswer.toNumber() / 10 ** decimals;
  } catch (error) {
    if (urlIndex >= urls.length - 1) {
      const error = `[getEthPrice] ${HEALTHY_RPC_SERVICES_ARE_OVER}`;
      throw new Error(error);
    }
    return await getEthPriceWithFallbacks(urls, urlIndex + 1);
  }
};
