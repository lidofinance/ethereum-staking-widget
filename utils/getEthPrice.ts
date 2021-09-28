import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  getAggregatorAddress,
  getAggregatorContractFactory,
  getRpcJsonUrls,
} from 'config';

export const getEthPrice = async (): Promise<number> => {
  const urls = getRpcJsonUrls(CHAINS.Mainnet);

  const address = getAggregatorAddress(CHAINS.Mainnet);
  const staticProvider = getStaticRpcBatchProvider(CHAINS.Mainnet, urls[0]);

  const contractFactory = getAggregatorContractFactory();
  const contract = contractFactory.connect(address, staticProvider);

  const [decimals, latestAnswer] = await Promise.all([
    contract.decimals(),
    contract.latestAnswer(),
  ]);

  const price = latestAnswer.toNumber() / 10 ** decimals;

  return price;
};
