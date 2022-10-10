import { CHAINS } from 'utils/chains';
import { ETHPLORER_TOKEN_ENDPOINT, getStethAddress } from 'config';
import getConfig from 'next/config';
import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';
import { serverLogger } from './serverLogger';

const { serverRuntimeConfig } = getConfig();
const { ethplorerApiKey } = serverRuntimeConfig;

type GetLidoStats = () => Promise<Response>;

// DEPRECATED: In future will be delete!!! Because we don't want to use https://api.ethplorer.io/
export const getLidoStats: GetLidoStats = async () => {
  serverLogger.debug('Fetching lido stats...');
  // IMPORTANT: ETHPLORER_TOKEN_ENDPOINT (api.ethplorer.io) works only with Mainnet chain!
  const api = `${ETHPLORER_TOKEN_ENDPOINT}${getStethAddress(CHAINS.Mainnet)}`;
  const query = new URLSearchParams({ apiKey: ethplorerApiKey });
  const url = `${api}?${query.toString()}`;

  const lidoStats = await responseTimeExternalMetricWrapper({
    payload: ETHPLORER_TOKEN_ENDPOINT,
    request: () => standardFetcher<Response>(url),
  });
  serverLogger.debug('Lido stats: ' + lidoStats);
  return lidoStats;
};
