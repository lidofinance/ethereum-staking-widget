/* eslint-disable no-unused-vars */
import nextConnect from 'next-connect';
import Cors from 'cors';
import { CloudFlareStorage } from '../../lib/cloudFlareStorage';
import { TerraRESTApi } from '../../lib/terra/api';
import { TerraStakingAprStatsStorage } from '../../lib/terra/statsStorage';
import { TAIL_LENGTH, TERRA_NODE_URL } from '../../config/terra';
import { TerraCron } from '../../lib/terra/cron';

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const HAS_CLOUDFLARE_CREDENTIALS =
  CLOUDFLARE_API_TOKEN && CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_KV_NAMESPACE_ID;

const cfStorage = new CloudFlareStorage(
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
);

const terraApi = new TerraRESTApi(TERRA_NODE_URL);
const statsStorage = new TerraStakingAprStatsStorage(cfStorage, {
  tailLength: TAIL_LENGTH,
});
const terraCron = new TerraCron(statsStorage, terraApi);

if (HAS_CLOUDFLARE_CREDENTIALS && process.env.NODE_ENV === 'production') {
  console.info('Terra Staking Stats: Cloudflare credentials was provided');
  terraCron.init();
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
    }
    updated = true;
    try {
      res.status(200).send(statsStorage.currentValue);
    } catch (e) {
      const error = {
        message: 'Something went wrong!',
      };
      console.error(e);
      res.status(500).send({ error });
    }
  });
