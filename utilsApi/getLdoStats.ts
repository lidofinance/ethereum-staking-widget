import { CHAINS } from 'utils/chains';
import { getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { ETHPLORER_TOKEN_ENDPOINT } from 'config';
import getConfig from 'next/config';
import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';
import { serverLogger } from './serverLogger';

const { serverRuntimeConfig } = getConfig();
const { ethplorerApiKey } = serverRuntimeConfig;

type GetLdoStats = () => Promise<Response>;

// DEPRECATED: In future will be delete!!! Because we don't want to use https://api.ethplorer.io/
export const getLdoStats: GetLdoStats = async () => {
  serverLogger.debug('Fetching LDO stats...');
  // IMPORTANT: ETHPLORER_TOKEN_ENDPOINT (api.ethplorer.io) works only with Mainnet chain!
  const api = `${ETHPLORER_TOKEN_ENDPOINT}${getTokenAddress(
    CHAINS.Mainnet as number,
    TOKENS.LDO,
  )}`;
  const query = new URLSearchParams({ apiKey: ethplorerApiKey });
  const url = `${api}?${query.toString()}`;

  const ldoStats = await responseTimeExternalMetricWrapper(() =>
    standardFetcher<Response>(url),
  )(api);
  serverLogger.debug('LDO stats: ' + ldoStats);

  return ldoStats;
};
