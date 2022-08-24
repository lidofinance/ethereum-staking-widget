import { Cache } from 'memory-cache';
import { CACHE_ETH_APR_KEY, CACHE_ETH_APR_TTL } from 'config';
import { getEthApr, serverErrorHandler } from 'utilsApi';
import { API } from 'types';

const cache = new Cache<typeof CACHE_ETH_APR_KEY, string>();

// Proxy for third-party API.
// Returns eth annual percentage rate
const ethApr: API = async (req, res) => {
  try {
    const cachedEthApr = cache.get(CACHE_ETH_APR_KEY);

    if (cachedEthApr) {
      res.json(cachedEthApr);
    } else {
      const ethApr = await getEthApr();
      cache.put(CACHE_ETH_APR_KEY, ethApr, CACHE_ETH_APR_TTL);

      res.json(ethApr);
    }
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export default ethApr;
