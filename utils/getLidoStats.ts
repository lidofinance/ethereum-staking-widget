import { CHAINS } from '@lido-sdk/constants';
import { ETHPLORER_TOKEN_ENDPOINT, getStethAddress } from 'config';
import getConfig from 'next/config';
import { standardFetcher } from './standardFetcher';

const { serverRuntimeConfig } = getConfig();
const { ethplorerApiKey } = serverRuntimeConfig;

type GetLidoStats = () => Promise<Response>;

export const getLidoStats: GetLidoStats = async () => {
  // ETHPLORER_TOKEN_ENDPOINT (api.ethplorer.io) works only with Mainnet chain!
  const api = `${ETHPLORER_TOKEN_ENDPOINT}${getStethAddress(CHAINS.Mainnet)}`;
  const query = new URLSearchParams({ apiKey: ethplorerApiKey });
  const url = `${api}?${query.toString()}`;

  return standardFetcher(url);
};
