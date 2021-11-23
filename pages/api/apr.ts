import { Cache } from 'memory-cache';
import {
  CACHE_ETH_APR_KEY,
  CACHE_ETH_APR_TTL,
  CACHE_STETH_APR_KEY,
  CACHE_STETH_APR_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import { getEthApr, getStethApr } from 'utils';
import { API } from 'types';
import { serverLogger } from 'utils/serverLogger';

const cacheEth = new Cache<typeof CACHE_ETH_APR_KEY, string>();
const cacheSteth = new Cache<typeof CACHE_STETH_APR_KEY, string>();

// Proxy for third-party API.
// Returns Eth & StEth annual percentage rate.
// This is a temporary duplicate of the two methods:
// - /api/eth-apr
// - /api/steth-apr
// DEPRECATED: In future will be delete!!! Use /api/eth-apr and /api/steth-apr
const apr: API = async (req, res) => {
  type resultDataType = {
    eth: string | null;
    steth: string | null;
  };

  const resultData: resultDataType = {
    eth: null,
    steth: null,
  };

  try {
    // Eth APR
    const cachedEthApr = cacheEth.get(CACHE_ETH_APR_KEY);

    if (cachedEthApr) {
      resultData.eth = cachedEthApr;
    } else {
      const ethApr = await getEthApr();
      cacheEth.put(CACHE_ETH_APR_KEY, ethApr, CACHE_ETH_APR_TTL);

      resultData.eth = ethApr;
    }

    // StEth APR
    const cachedStethApr = cacheSteth.get(CACHE_STETH_APR_KEY);

    if (cachedStethApr) {
      resultData.steth = cachedStethApr;
    } else {
      const stethApr = await getStethApr();
      cacheSteth.put(CACHE_STETH_APR_KEY, stethApr, CACHE_STETH_APR_TTL);

      resultData.steth = stethApr;
    }

    // Return
    res.json({
      data: resultData,
    });
  } catch (error) {
    serverLogger.error(error);
    if (error instanceof Error) {
      res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
    } else {
      res.status(500).json(DEFAULT_API_ERROR_MESSAGE);
    }
  }
};

export default apr;
