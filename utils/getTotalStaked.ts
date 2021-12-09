import { formatEther } from '@ethersproject/units';
import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  getRpcJsonUrls,
  getStethAddress,
  getStethContractFactory,
} from 'config';

export const getTotalStaked = async (): Promise<string> => {
  const urls = getRpcJsonUrls(CHAINS.Mainnet);
  return getTotalStakedWithFallbacks(urls, 0);
};

const getTotalStakedWithFallbacks = async (
  urls: Array<string>,
  urlIndex: number,
): Promise<string> => {
  // TODO: remove api-key from log
  console.log('[getTotalStaked] Try get via', urls[urlIndex]);

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

    const totalSupplyStWei = await stethContract.totalSupply();
    const totalSupplyStEth = formatEther(totalSupplyStWei);
    return Number(totalSupplyStEth).toFixed(8);
  } catch (error) {
    if (urlIndex >= urls.length - 1) {
      console.log('Healthy RPC services are over! Throw error');
      throw error;
    }
  }

  return await getTotalStakedWithFallbacks(urls, urlIndex + 1);
};
