import { getTokenAddress, TOKENS } from '@lido-sdk/constants';

import { secretConfig } from 'config';
import { ETHPLORER_TOKEN_ENDPOINT } from 'consts/api';
import { CHAINS } from 'consts/chains';
import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';

type GetLdoStats = () => Promise<Response>;

// DEPRECATED: In future will be delete!!! Because we don't want to use https://api.ethplorer.io/
export const getLdoStats: GetLdoStats = async () => {
  console.debug('Fetching LDO stats...');
  // IMPORTANT: ETHPLORER_TOKEN_ENDPOINT (api.ethplorer.io) works only with Mainnet chain!
  const api = `${ETHPLORER_TOKEN_ENDPOINT}${getTokenAddress(
    CHAINS.Mainnet as number,
    TOKENS.LDO,
  )}`;
  const query = new URLSearchParams({
    apiKey: secretConfig.ethplorerApiKey ?? '',
  });
  const url = `${api}?${query.toString()}`;

  const ldoStats = await responseTimeExternalMetricWrapper({
    payload: ETHPLORER_TOKEN_ENDPOINT,
    request: () => standardFetcher<Response>(url),
  });
  console.debug('LDO stats: ' + ldoStats);

  return ldoStats;
};
