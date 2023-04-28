import nextConnect from 'next-connect';
import Cors from 'cors';
import cache from 'memory-cache';
import { TerraRESTApi } from '../../lib/terra/api';
import {
  HUB_CONTRACT,
  TERRA_NODE_URL,
  VALIDATORS_CACHE_TIME_MS,
  VALIDATORS_REGISTRY_CONTRACT,
  VALIDATORS_CACHE_KEY,
  CONTRACT_VERSION,
} from '../../config/terraTestnet';

const terraApi = new TerraRESTApi(TERRA_NODE_URL);

// ---
//  Request Handler
// ---
export default nextConnect()
  .use(
    Cors({
      methods: 'GET',
      origin: '*',
    }),
  )
  .get(async (_req, res) => {
    try {
      if (CONTRACT_VERSION !== '2')
        return res.status(500).json('Wrong environment');
      let validators = cache.get(VALIDATORS_CACHE_KEY);
      if (!validators) {
        validators = await terraApi.getValidatorsWithBalances({
          hubContract: HUB_CONTRACT,
          validatorsContract: VALIDATORS_REGISTRY_CONTRACT,
          version: 2,
        });
        cache.put(VALIDATORS_CACHE_KEY, validators, VALIDATORS_CACHE_TIME_MS);
      }

      res.status(200).json({ validators });
    } catch (e) {
      const error = {
        message: 'Something went wrong!',
      };
      console.error(e);
      res.status(500).json({ error });
    }
  });
