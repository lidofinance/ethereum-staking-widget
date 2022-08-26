import Cors from 'cors';
import { Cache } from 'memory-cache';
import {
  CACHE_ETH_APR_KEY,
  CACHE_ETH_APR_TTL,
  CACHE_STETH_APR_KEY,
  CACHE_STETH_APR_TTL,
  CACHE_DEFAULT_HEADERS,
  CACHE_DEFAULT_ERROR_HEADERS,
} from 'config';
import initMiddleware from 'lib/init-middleware';
import {
  getEthApr,
  getStethApr,
  wrapRequest,
  defaultErrorHandler,
  cacheControl,
  errorCacheControl,
} from 'utilsApi';
import { API } from 'types';

const cacheEth = new Cache<typeof CACHE_ETH_APR_KEY, string>();
const cacheSteth = new Cache<typeof CACHE_STETH_APR_KEY, string>();

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
);

// Proxy for third-party API.
// Returns Eth & StEth annual percentage rate.
// This is a temporary duplicate of the two methods:
// - /api/eth-apr
// - /api/steth-apr
// DEPRECATED: In future will be delete!!! Use /api/eth-apr and /api/steth-apr
const apr: API = async (req, res) => {
  // Run cors
  await cors(req, res);

  type resultDataType = {
    eth: string | null;
    steth: string | null;
  };

  const resultData: resultDataType = {
    eth: null,
    steth: null,
  };

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
};

export default wrapRequest(apr, [
  cacheControl(CACHE_DEFAULT_HEADERS),
  errorCacheControl(CACHE_DEFAULT_ERROR_HEADERS),
  defaultErrorHandler,
]);
