import { Cache } from 'memory-cache';
import { CACHE_ETH_PRICE_KEY, CACHE_ETH_PRICE_TTL } from 'config';
import { getEthPrice, serverErrorHandler } from 'utilsApi';
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
    serverErrorHandler(error, res);
  }
};

export default ethPrice;
