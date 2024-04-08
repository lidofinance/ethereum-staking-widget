import { formatEther } from '@ethersproject/units';
import { StethAbiFactory } from '@lido-sdk/contracts';
import { getTokenAddress, TOKENS } from '@lido-sdk/constants';

import { HEALTHY_RPC_SERVICES_ARE_OVER } from 'consts/api';
import { CHAINS } from 'consts/chains';

import { getStaticRpcBatchProvider } from './rpcProviders';
import { rpcUrls } from './rpcUrls';

export const getTotalStaked = async (
  chainId = CHAINS.Mainnet,
): Promise<string> => {
  const urls = rpcUrls[chainId];
  return getTotalStakedWithFallbacks(urls, 0, chainId);
};

const getTotalStakedWithFallbacks = async (
  urls: Array<string>,
  urlIndex: number,
  chainId = CHAINS.Mainnet,
): Promise<string> => {
  try {
    const staticProvider = getStaticRpcBatchProvider(chainId, urls[urlIndex]);

    const stethAddress = getTokenAddress(chainId as number, TOKENS.STETH);
    const stethContract = StethAbiFactory.connect(stethAddress, staticProvider);

    const totalSupplyStWei = await stethContract.totalSupply();

    const totalSupplyStEth = formatEther(totalSupplyStWei);
    return Number(totalSupplyStEth).toFixed(8);
  } catch (error) {
    if (urlIndex >= urls.length - 1) {
      const error = `[getTotalStaked] ${HEALTHY_RPC_SERVICES_ARE_OVER}`;
      console.error(error);
      throw new Error(error);
    }
    return await getTotalStakedWithFallbacks(urls, urlIndex + 1, chainId);
  }
};
