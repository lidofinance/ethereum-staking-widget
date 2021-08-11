import { JsonRpcProvider } from '@ethersproject/providers';
import { CHAINS } from '@lido-sdk/constants';
import {
  getAggregatorAddress,
  getAggregatorContractFactory,
  getRpcJsonUrls,
} from 'config';

export const getEthPrice = async (): Promise<number> => {
  const urls = getRpcJsonUrls(CHAINS.Mainnet);

  const address = getAggregatorAddress(CHAINS.Mainnet);
  const library = new JsonRpcProvider(urls[0], CHAINS.Mainnet);

  const contractFactory = getAggregatorContractFactory();
  const contract = contractFactory.connect(address, library);

  const [decimals, latestAnswer] = await Promise.all([
    contract.decimals(),
    contract.latestAnswer(),
  ]);

  const price = latestAnswer.toNumber() / 10 ** decimals;

  return price;
};
