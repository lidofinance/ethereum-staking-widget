import { Cache } from 'memory-cache';
import { CHAINS } from '@lido-sdk/constants';
import {
  CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY,
  CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import {
  getTotalStaked,
  getLidoHoldersViaSubgraphs,
  getStEthPrice,
} from 'utilsApi';
import { API } from 'types';

const cache = new Cache<typeof CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY, unknown>();

// Proxy for third-party API.
// Returns stETH token information
const shortLidoStats: API = async (req, res) => {
  try {
    const cachedLidoStats = cache.get(CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY);

    if (cachedLidoStats) {
      res.status(200).json(cachedLidoStats);
    } else {
      const chainId = Number(req.query.chainId) as CHAINS;
      const lidoHolders = await getLidoHoldersViaSubgraphs(chainId);
      const totalStaked = await getTotalStaked();
      const stEthPrice = await getStEthPrice();

      const shortLidoStats = {
        uniqueAnytimeHolders: lidoHolders?.data?.stats?.uniqueAnytimeHolders,
        uniqueHolders: lidoHolders?.data?.stats?.uniqueHolders,
        totalStaked,
        marketCap: Number(totalStaked) * stEthPrice,
      };

      cache.put(
        CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY,
        shortLidoStats,
        CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_TTL,
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
