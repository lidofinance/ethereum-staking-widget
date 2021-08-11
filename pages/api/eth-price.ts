import { Cache } from 'memory-cache';
import { CACHE_ETH_PRICE_KEY, CACHE_ETH_PRICE_TTL } from 'config';
import { getEthPrice } from 'utils';
import { API } from 'types';

const cache = new Cache<typeof CACHE_ETH_PRICE_KEY, number>();

const EthPrice: API = async (req, res) => {
  try {
    const cachedPrice = cache.get(CACHE_ETH_PRICE_KEY);

    if (cachedPrice) {
      res.json(cachedPrice);
    } else {
      const price = await getEthPrice();
      cache.put(CACHE_ETH_PRICE_KEY, price, CACHE_ETH_PRICE_TTL);

      res.json(price);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export default EthPrice;
