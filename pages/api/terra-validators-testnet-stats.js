import nextConnect from 'next-connect';
import Cors from 'cors';
import cache from 'memory-cache';
import { TerraRESTApi } from '../../lib/terra/api';
import {
  HUB_CONTRACT,
  TERRA_NODE_URL,
  VALIDATORS_CACHE_TIME_TS,
  VALIDATORS_REGISTRY_CONTRACT,
  VALIDATORS_CACHE_KEY,
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
      let validators = cache.get(VALIDATORS_CACHE_KEY);
      if (!validators) {
        validators = await terraApi.getValidatorsWithBalances({
          hubContract: HUB_CONTRACT,
          validatorsContract: VALIDATORS_REGISTRY_CONTRACT,
          version: 2,
        });
        cache.put(VALIDATORS_CACHE_KEY, validators, VALIDATORS_CACHE_TIME_TS);
      }

      res.status(200).send({ validators });
    } catch (e) {
      const error = {
        message: 'Something went wrong!',
      };
      console.error(e);
      res.status(500).send({ error });
    }
  });
