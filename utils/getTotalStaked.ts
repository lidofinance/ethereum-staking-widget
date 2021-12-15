import { formatEther } from '@ethersproject/units';
import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  getRpcJsonUrls,
  getStethAddress,
  getStethContractFactory,
  HEALTHY_RPC_SERVICES_ARE_OVER,
} from 'config';
import { rpcResponseTime, INFURA, ALCHEMY } from 'utils/metrics';

export const getTotalStaked = async (): Promise<string> => {
  const urls = getRpcJsonUrls(CHAINS.Mainnet);
  return getTotalStakedWithFallbacks(urls, 0);
};

const getTotalStakedWithFallbacks = async (
  urls: Array<string>,
  urlIndex: number,
): Promise<string> => {
  try {
    const staticProvider = getStaticRpcBatchProvider(
      CHAINS.Mainnet,
      urls[urlIndex],
    );

    const stethAddress = getStethAddress(CHAINS.Mainnet);
    const stethContractFactory = getStethContractFactory();
    const stethContract = stethContractFactory.connect(
      stethAddress,
      staticProvider,
    );

    const endMetric = rpcResponseTime.startTimer();

    const totalSupplyStWei = await stethContract.totalSupply();

    if (urls[urlIndex].indexOf(INFURA) > -1) {
      console.log('[getTotalStaked] Get via infura');
      endMetric({ provider: INFURA });
    }
    if (urls[urlIndex].indexOf(ALCHEMY) > -1) {
      console.log('[getTotalStaked] Get via alchemy');
      endMetric({ provider: ALCHEMY });
    }

    const totalSupplyStEth = formatEther(totalSupplyStWei);
    return Number(totalSupplyStEth).toFixed(8);
  } catch (error) {
    if (urlIndex >= urls.length - 1) {
      const error = `[getTotalStaked] ${HEALTHY_RPC_SERVICES_ARE_OVER}`;
      throw new Error(error);
    }
    return await getTotalStakedWithFallbacks(urls, urlIndex + 1);
  }
};
