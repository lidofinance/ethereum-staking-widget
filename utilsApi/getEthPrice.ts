import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  getAggregatorAddress,
  getAggregatorContractFactory,
  getRpcJsonUrls,
  HEALTHY_RPC_SERVICES_ARE_OVER,
} from 'config';
import { serverLogger } from 'utilsApi';
// import { rpcResponseTime, INFURA, ALCHEMY } from 'utilsApi/metrics';

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
    const chainId = CHAINS.Mainnet;
    const staticProvider = getStaticRpcBatchProvider(chainId, urls[urlIndex]);

    const contractFactory = getAggregatorContractFactory();
    const contract = contractFactory.connect(address, staticProvider);

    // const endMetric = rpcResponseTime.startTimer();

    // TODO: maybe without Promise.all
    const [decimals, latestAnswer] = await Promise.all([
      contract.decimals(),
      contract.latestAnswer(),
    ]);

    // if (urls[urlIndex].indexOf(INFURA) > -1) {
    //   serverLogger.log('[getEthApr] Get via infura');
    //   endMetric({ provider: INFURA, chainId: String(chainId) });
    // }
    // if (urls[urlIndex].indexOf(ALCHEMY) > -1) {
    //   serverLogger.log('[getEthApr] Get via alchemy');
    //   endMetric({ provider: ALCHEMY, chainId: String(chainId) });
    // }

    return latestAnswer.toNumber() / 10 ** decimals;
  } catch (error) {
    if (urlIndex >= urls.length - 1) {
      const error = `[getEthPrice] ${HEALTHY_RPC_SERVICES_ARE_OVER}`;
      throw new Error(error);
    }
    return await getEthPriceWithFallbacks(urls, urlIndex + 1);
  }
};
