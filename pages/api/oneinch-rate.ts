import { Cache } from 'memory-cache';
import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
import {
  CACHE_ONE_INCH_RATE_KEY,
  CACHE_ONE_INCH_RATE_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import { getOneInchRate } from 'utils';
import { API } from 'types';

const cache = new Cache<typeof CACHE_ONE_INCH_RATE_KEY, Response>();

// Proxy for third-party API.
// Returns 1inch rate
const oneInchRate: API = async (req, res) => {
  try {
    const cachedOneInchRate = cache.get(CACHE_ONE_INCH_RATE_KEY);

    if (cachedOneInchRate) {
      res.status(200).json(cachedOneInchRate);
    } else {
      const rawData = await getOneInchRate(
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        getTokenAddress(CHAINS.Mainnet, TOKENS.STETH),
        10 ** 18,
      );
      const oneInchRate = rawData.toTokenAmount / 10 ** 18;
      cache.put(CACHE_ONE_INCH_RATE_KEY, oneInchRate, CACHE_ONE_INCH_RATE_TTL);

      res.status(200).json(oneInchRate);
    }
  } catch (error) {
    res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
  }
};

export default oneInchRate;
