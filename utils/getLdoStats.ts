import { CHAINS, getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { ETHPLORER_TOKEN_ENDPOINT } from 'config';
import getConfig from 'next/config';
import { standardFetcher } from './standardFetcher';

const { serverRuntimeConfig } = getConfig();
const { ethplorerApiKey } = serverRuntimeConfig;

type GetLdoStats = () => Promise<Response>;

// DEPRECATED: In future will be delete!!! Because we don't want to use https://api.ethplorer.io/
export const getLdoStats: GetLdoStats = async () => {
  // IMPORTANT: ETHPLORER_TOKEN_ENDPOINT (api.ethplorer.io) works only with Mainnet chain!
  const api = `${ETHPLORER_TOKEN_ENDPOINT}${getTokenAddress(
    CHAINS.Mainnet,
    TOKENS.LDO,
  )}`;
  const query = new URLSearchParams({ apiKey: ethplorerApiKey });
  const url = `${api}?${query.toString()}`;

  return standardFetcher(url);
};
