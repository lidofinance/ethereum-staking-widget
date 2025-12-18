import * as z from 'zod';
import { CHAINS } from 'consts/chains';
import { getContractAddress } from 'config/networks/contract-address';
import { standardFetcher } from 'utils/standardFetcher';
import { UNIX_TIMESTAMP_SCHEMA, PERCENT_SCHEMA, APY_SCHEMA } from 'utils/zod';
import { STG_STATS_ORIGIN } from './consts';

export const ALLOCATION_SCHEMA = z.array(
  z.object({
    id: z.string(),
    label: z.string(),
    sharePercent: PERCENT_SCHEMA,
    tvl: z.object({
      amount: z.string(),
      asset: z.string(),
      decimals: z.number(),
    }),
    chain: z.string(),
  }),
);
export const STG_STATS_SCHEMA = z.object({
  apy: APY_SCHEMA,
  allocations: ALLOCATION_SCHEMA,
  lastUpdate: UNIX_TIMESTAMP_SCHEMA,
});

export type STGStatsFetchedData = z.infer<typeof STG_STATS_SCHEMA>;

export const fetchSTGStats = async () => {
  const stgVaultAddress = getContractAddress(CHAINS.Mainnet, 'stgVault');
  const STG_STATS_ENDPOINT = `${STG_STATS_ORIGIN}/v1/chain/${CHAINS.Mainnet}/core-vaults/${stgVaultAddress}/data`;

  return standardFetcher<STGStatsFetchedData>(STG_STATS_ENDPOINT);
};

export const fetchSTGStatsApr = async () => {
  const data = await fetchSTGStats();
  const apy = APY_SCHEMA.parse(data.apy);
  return apy;
};
