import { Cache } from 'memory-cache';
import Metrics from 'utilsApi/metrics';
import { standardFetcher } from 'utils/standardFetcher';
import { serverLogger } from './serverLogger';
import { SubgraphChains } from 'types';
import { getSubgraphUrl } from './getSubgraphUrl';
import {
  CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY,
  CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_TTL,
} from 'config';
import getConfig from 'next/config';
import ms from 'ms';
const { serverRuntimeConfig } = getConfig();

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

export const getLidoHoldersViaSubgraphs: GetLidoHoldersViaSubgraphs = async (
  chainId: SubgraphChains,
) => {
  serverLogger.debug(
    '[getLidoHoldersViaSubgraphs] Fetching lido holders from subgraph...',
  );
  const query = `
    query {
      stats (id: "") {
        uniqueHolders
        uniqueAnytimeHolders
      }
    }
  `;

  const controller = new AbortController();

  const TIMEOUT = +serverRuntimeConfig.subgraphRequestTimeout || ms('5s');
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  const params = {
    method: 'POST',
    body: JSON.stringify({ query }),
    signal: controller.signal as AbortSignal,
  };

  const endMetric = Metrics.subgraphsResponseTime.startTimer();

  const url = getSubgraphUrl(chainId);

  if (!url) {
    throw new Error('Error: subgraph chain is not supported');
  }

  try {
    const responseJsoned = await standardFetcher<LidoHolders>(url, params);

    endMetric();
    clearTimeout(timeoutId);

    serverLogger.debug(
      '[getLidoHoldersViaSubgraphs] Lido holders: ',
      responseJsoned,
    );

    cache.put(
      CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY,
      responseJsoned,
      CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_TTL,
    );

    return responseJsoned;
  } catch (error) {
    serverLogger.error(
      '[getLidoHoldersViaSubgraphs] Subgraph request failed. Using long-term cache...',
    );
    return cache.get(CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY);
  }
};
