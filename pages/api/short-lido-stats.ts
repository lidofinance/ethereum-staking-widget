import { Cache } from 'memory-cache';
import { CACHE_LIDO_SHORT_STATS_KEY, CACHE_LIDO_SHORT_STATS_TTL } from 'config';
import {
  getTotalStaked,
  getLidoHoldersViaSubgraphs,
  getStEthPrice,
  defaultErrorAndCacheWrapper,
} from 'utilsApi';
import { API, SubgraphChains } from 'types';
import { parallelizePromises } from 'utils';

const cache = new Cache<typeof CACHE_LIDO_SHORT_STATS_KEY, unknown>();

// Proxy for third-party API.
// Returns stETH token information
const shortLidoStats: API = async (req, res) => {
  const cachedLidoStats = cache.get(CACHE_LIDO_SHORT_STATS_KEY);
  if (cachedLidoStats) {
    res.status(200).json(cachedLidoStats);
  } else {
    const chainId = Number(req.query.chainId) as SubgraphChains;

    const [lidoHolders, totalStaked, stEthPrice] = parallelizePromises([
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
};

export default defaultErrorAndCacheWrapper(shortLidoStats);
