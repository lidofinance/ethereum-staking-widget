import nextConnect from 'next-connect';
import Cors from 'cors';
import cache from 'memory-cache';
import { TerraRESTApi } from '../../lib/terra/api';
import { CloudFlareStorage } from '../../lib/cloudFlareStorage';
import { TerraStakingAprStatsStorage } from '../../lib/terra/statsStorage';
import { TerraCron } from '../../lib/terra/cron';
import _ from 'lodash';
import {
  ST_LUNA_APR_CACHE_MS,
  ST_LUNA_COUNT_DAYS,
  TERRA_NODE_URL,
  HUB_CONTRACT,
  STAKERS_ADDRESS,
  TAIL_LENGTH,
  CRON_JOB,
  DEFAULT_CLAIMS,
  DEFAULT_STAKERS,
  STORAGE_KEY_PREFIX,
} from '../../config/terraTestnet';

const ONE_YEAR = 60 * 60 * 24 * 365 * 1000;
const CACHE_KEY = 'st_luna_apr';

const terraApi = new TerraRESTApi(TERRA_NODE_URL);
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const HAS_CLOUDFLARE_CREDENTIALS =
  CLOUDFLARE_API_TOKEN && CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_KV_NAMESPACE_ID;

const cfStorage = new CloudFlareStorage(
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
  STORAGE_KEY_PREFIX,
);

const statsStorage = new TerraStakingAprStatsStorage(cfStorage, {
  tailLength: TAIL_LENGTH,
  defaultClaims: DEFAULT_CLAIMS,
  defaultStakers: DEFAULT_STAKERS,
});
const terraCron = new TerraCron(statsStorage, terraApi, {
  hubContract: HUB_CONTRACT,
  stakersAddress: STAKERS_ADDRESS,
  cronString: CRON_JOB,
});

if (HAS_CLOUDFLARE_CREDENTIALS && process.env.NODE_ENV) {
  console.info('Terra Staking Stats: Cloudflare credentials was provided');
  terraCron.init();
}

async function getStLunaAPR() {
  const lastBlockHeight = await terraApi.getLastBlockHeight();
  const farBlock = await terraApi.getBlock(
    lastBlockHeight - ST_LUNA_COUNT_DAYS * 7 * 60 * 24,
  );
  const { height: farBlockHeight, time: farBlockTime } = farBlock;

  const [nowState, farState] = await Promise.all([
    terraApi.getContractState(HUB_CONTRACT),
    terraApi.getContractState(HUB_CONTRACT, farBlockHeight),
  ]);

  const exchangeDiff =
    parseFloat(nowState.result.stluna_exchange_rate) -
    parseFloat(farState.result.stluna_exchange_rate);

  const exchangeDiffPeYear =
    (ONE_YEAR * exchangeDiff) / (Date.now() - new Date(farBlockTime).getTime());

  return (exchangeDiffPeYear * 100).toFixed(2); //%
}

let updated = false;

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
    if (!updated && HAS_CLOUDFLARE_CREDENTIALS) {
      await statsStorage.sync();
      updated = true;
    }
    let stLunaApr = cache.get(CACHE_KEY);
    if (!stLunaApr) {
      stLunaApr = await getStLunaAPR();
      cache.put(CACHE_KEY, stLunaApr, ST_LUNA_APR_CACHE_MS);
    }
    try {
      res.status(200).send({
        stLunaApr,
        ...statsStorage.currentValue,
        ...(_.has(_req.query, 'debug') && {
          debug: statsStorage._claimedRewards.tail,
        }),
      });
    } catch (e) {
      const error = {
        message: 'Something went wrong!',
      };
      console.error(e);
      res.status(500).send({ error });
    }
  });
