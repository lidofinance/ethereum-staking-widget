import { formatEther } from '@ethersproject/units';
import { getStaticRpcBatchProvider } from './rpcProviders';
import { StethAbiFactory } from '@lido-sdk/contracts';
import { getTokenAddress, TOKENS, CHAINS } from '@lido-sdk/constants';
import { HEALTHY_RPC_SERVICES_ARE_OVER } from 'config';
import { serverLogger } from './serverLogger';
import { rpcUrls } from './rpcUrls';

export const getTotalStaked = async (): Promise<string> => {
  const urls = rpcUrls[CHAINS.Mainnet];
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

    const stethAddress = getTokenAddress(CHAINS.Mainnet, TOKENS.STETH);
    const stethContract = StethAbiFactory.connect(stethAddress, staticProvider);

    const totalSupplyStWei = await stethContract.totalSupply();

    const totalSupplyStEth = formatEther(totalSupplyStWei);
    return Number(totalSupplyStEth).toFixed(8);
  } catch (error) {
    if (urlIndex >= urls.length - 1) {
      const error = `[getTotalStaked] ${HEALTHY_RPC_SERVICES_ARE_OVER}`;
      serverLogger.error(error);
      throw new Error(error);
    }
    return await getTotalStakedWithFallbacks(urls, urlIndex + 1);
  }
};
