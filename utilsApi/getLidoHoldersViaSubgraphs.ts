import ms from 'ms';
import { Cache } from 'memory-cache';

import { config, secretConfig } from 'config';
import { SubgraphChains } from 'types';
import Metrics from 'utilsApi/metrics';
import { standardFetcher } from 'utils/standardFetcher';

import { getSubgraphUrl } from './getSubgraphUrl';

const SUBGRAPH_ERROR_MESSAGE =
  '[getLidoHoldersViaSubgraphs] Subgraph request failed.';

interface LidoHolders extends Response {
  data: {
    stats: {
      uniqueAnytimeHolders: string;
      uniqueHolders: string;
    };
  };
}

const cache = new Cache<string, LidoHolders>();

type GetLidoHoldersViaSubgraphs = (
  chainId: SubgraphChains,
) => Promise<LidoHolders | null>;

export const getLidoHoldersViaSubgraphs: GetLidoHoldersViaSubgraphs = async (
  chainId: SubgraphChains,
) => {
  const cacheKey = `${config.CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY}_${chainId}`;

  console.debug('[getLidoHoldersViaSubgraphs] Started fetching... ');
  const query = `
    query {
      stats (id: "") {
        uniqueHolders
        uniqueAnytimeHolders
      }
    }
  `;

  const controller = new AbortController();

  const TIMEOUT = +secretConfig.subgraphRequestTimeout || ms('5s');
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  const params = {
    method: 'POST',
    body: JSON.stringify({ query }),
    signal: controller.signal,
  };

  const endMetric = Metrics.subgraph.subgraphsResponseTime.startTimer();

  const url = getSubgraphUrl(chainId);

  if (!url) {
    throw new Error(`Error: subgraph chain is not supported ${chainId}`);
  }

  try {
    const responseJsoned = await standardFetcher<LidoHolders>(url, params);

    endMetric();
    clearTimeout(timeoutId);

    console.debug('[getLidoHoldersViaSubgraphs] Lido holders:', responseJsoned);

    cache.put(
      cacheKey,
      responseJsoned,
      config.CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_TTL,
    );

    return responseJsoned;
  } catch (error) {
    const data = cache.get(cacheKey);

    if (data) {
      console.error(`${SUBGRAPH_ERROR_MESSAGE} Using long-term cache...`);
      return data;
    }

    if (error instanceof Error) {
      throw new Error(error.message ?? SUBGRAPH_ERROR_MESSAGE);
    } else {
      throw new Error(SUBGRAPH_ERROR_MESSAGE);
    }
  }
};
