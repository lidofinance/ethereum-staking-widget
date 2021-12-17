import { Cache } from 'memory-cache';
import {
  CACHE_ETH_PRICE_KEY,
  CACHE_ETH_PRICE_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import { getEthPrice } from 'utilsApi';
import { API } from 'types';

const cache = new Cache<typeof CACHE_ETH_PRICE_KEY, unknown>();

// Proxy for third-party API.
const ethPrice: API = async (req, res) => {
  try {
    const cachedEthPrice = cache.get(CACHE_ETH_PRICE_KEY);

    if (cachedEthPrice) {
      res.json(cachedEthPrice);
    } else {
      const ethPrice = await getEthPrice();
      cache.put(CACHE_ETH_PRICE_KEY, { price: ethPrice }, CACHE_ETH_PRICE_TTL);

      res.json({ price: ethPrice });
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

export default ethPrice;
