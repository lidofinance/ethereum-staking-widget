import { subgraphsResponseTime } from 'utilsApi/metrics';
import { standardFetcher } from 'utils/standardFetcher';
import { serverLogger } from './serverLogger';
import { CHAINS } from '@lido-sdk/constants';
import { getSubgraphUrl } from './getSubgraphUrl';

interface LidoHolders extends Response {
  data: {
    stats: {
      uniqueAnytimeHolders: string;
      uniqueHolders: string;
    };
  };
}

type GetLidoHoldersViaSubgraphs = (chainId: CHAINS) => Promise<LidoHolders>;

export const getLidoHoldersViaSubgraphs: GetLidoHoldersViaSubgraphs = async (
  chainId: CHAINS,
) => {
  serverLogger.debug('Fetching lido holders from subgraph...');
  const query = `
    query {
      stats (id: "") {
        uniqueHolders
        uniqueAnytimeHolders
      }
    }
  `;

  const params = {
    method: 'POST',
    body: JSON.stringify({ query }),
  };

  const endMetric = subgraphsResponseTime.startTimer();

  const url = getSubgraphUrl(chainId);

  if (!url) {
    throw new Error('Error: subgraph chain is not supported');
  }

  const responseJsoned = await standardFetcher<LidoHolders>(url, params);

  endMetric();

  serverLogger.debug('Lido holders: ', responseJsoned);

  return responseJsoned;
};
