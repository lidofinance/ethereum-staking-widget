import { TOKENS, getTokenAddress, CHAINS } from '@lido-sdk/constants';

import { secretConfig } from 'config';
import { ETHPLORER_TOKEN_ENDPOINT } from 'consts/api';
import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';

type GetLidoStats = () => Promise<Response>;

// DEPRECATED: In future will be delete!!! Because we don't want to use https://api.ethplorer.io/
export const getLidoStats: GetLidoStats = async () => {
  console.debug('[getLidoStats] Started fetching...');
  // IMPORTANT: ETHPLORER_TOKEN_ENDPOINT (api.ethplorer.io) works only with Mainnet chain!
  const api = `${ETHPLORER_TOKEN_ENDPOINT}${getTokenAddress(
    CHAINS.Mainnet,
    TOKENS.STETH,
  )}`;
  const query = new URLSearchParams({
    apiKey: secretConfig.ethplorerApiKey ?? '',
  });
  const url = `${api}?${query.toString()}`;

  const lidoStats = await responseTimeExternalMetricWrapper({
    payload: ETHPLORER_TOKEN_ENDPOINT,
    request: () => standardFetcher<Response>(url),
  });
  console.debug('[getLidoStats] Lido stats:', lidoStats);
  return lidoStats;
};
