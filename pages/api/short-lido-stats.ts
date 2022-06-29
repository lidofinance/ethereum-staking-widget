import { Cache } from 'memory-cache';
import {
  CACHE_LIDO_SHORT_STATS_KEY,
  CACHE_LIDO_SHORT_STATS_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import {
  getTotalStaked,
  getLidoHoldersViaSubgraphs,
  getStEthPrice,
} from 'utilsApi';
import { API, SubgraphChains } from 'types';
import { parallelizePromises } from 'utils';

const cache = new Cache<typeof CACHE_LIDO_SHORT_STATS_KEY, unknown>();

// Proxy for third-party API.
// Returns stETH token information
const shortLidoStats: API = async (req, res) => {
  try {
    const cachedLidoStats = cache.get(CACHE_LIDO_SHORT_STATS_KEY);

    if (cachedLidoStats) {
      res.status(200).json(cachedLidoStats);
    } else {
      const chainId = Number(req.query.chainId) as SubgraphChains;

      const [lidoHolders, totalStaked, stEthPrice] = await parallelizePromises([
        getLidoHoldersViaSubgraphs(chainId),
        getTotalStaked(),
        getStEthPrice(),
      ]);

      const shortLidoStats = {
        uniqueAnytimeHolders: lidoHolders?.data?.stats?.uniqueAnytimeHolders,
        uniqueHolders: lidoHolders?.data?.stats?.uniqueHolders,
        totalStaked,
        marketCap: Number(totalStaked) * stEthPrice,
      };

      cache.put(
        CACHE_LIDO_SHORT_STATS_KEY,
        shortLidoStats,
        CACHE_LIDO_SHORT_STATS_TTL,
      );

      res.status(200).json(shortLidoStats);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
    } else {
      res.status(500).json(DEFAULT_API_ERROR_MESSAGE);
    }
  }
};

export default shortLidoStats;
