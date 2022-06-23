import { Cache } from 'memory-cache';
import { subgraphsResponseTime } from 'utilsApi/metrics';
import { standardFetcher } from 'utils/standardFetcher';
import { serverLogger } from './serverLogger';
import { SubgraphChains } from 'types';
import { getSubgraphUrl } from './getSubgraphUrl';
import { AbortController } from 'node-abort-controller';
import {
  CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY,
  CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_TTL,
} from 'config';

interface LidoHolders extends Response {
  data: {
    stats: {
      uniqueAnytimeHolders: string;
      uniqueHolders: string;
    };
  };
}

const cache = new Cache<
  typeof CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY,
  LidoHolders
>();

type GetLidoHoldersViaSubgraphs = (
  chainId: SubgraphChains,
) => Promise<LidoHolders | null>;

const controller = new AbortController();

const TIMEOUT = 5000;
const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

export const getLidoHoldersViaSubgraphs: GetLidoHoldersViaSubgraphs = async (
  chainId: SubgraphChains,
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
    signal: controller.signal as AbortSignal,
  };

  const endMetric = subgraphsResponseTime.startTimer();

  const url = getSubgraphUrl(chainId);

  if (!url) {
    throw new Error('Error: subgraph chain is not supported');
  }

  try {
    const responseJsoned = await standardFetcher<LidoHolders>(url, params);

    clearTimeout(timeoutId);

    endMetric();

    serverLogger.debug('Lido holders: ', responseJsoned);

    cache.put(
      CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY,
      responseJsoned,
      CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_TTL,
    );

    return responseJsoned;
  } catch (error) {
    serverLogger.error(error);
    return cache.get(CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY);
  }
};
