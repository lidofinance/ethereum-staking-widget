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
  const staticProvider = getStaticRpcBatchProvider(CHAINS.Mainnet, urls[0]);

  const stethAddress = getStethAddress(CHAINS.Mainnet);
  const stethContractFactory = getStethContractFactory();
  const stethContract = stethContractFactory.connect(
    stethAddress,
    staticProvider,
  );

  const totalSupplyStWei = await stethContract.totalSupply();
  const totalSupplyStEth = formatEther(totalSupplyStWei);
  return Number(totalSupplyStEth).toFixed(8);
};
