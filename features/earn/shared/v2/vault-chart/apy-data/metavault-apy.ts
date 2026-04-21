import { z } from 'zod';

import { CHAINS } from 'consts/chains';
import { standardFetcher } from 'utils/standardFetcher';
import { UNIX_TIMESTAMP_SCHEMA } from 'utils/zod';

import { METAVAULT_CHART_ORIGIN } from '../consts';

const TIMESTAMP_LAUNCH_DATE = 1773100800; // 10 March 2026

export const METAVAULT_CHART_DATA_SCHEMA = z.array(
  z.object({
    tvl: z.object({
      asset: z.string(),
      amount: z.string(),
      decimals: z.number(),
    }),
    total_shares: z.object({
      amount: z.string(),
      decimals: z.number(),
    }),
    lp_price: z.object({
      value: z.string(),
      decimals: z.number(),
    }),
    timestamp: z.string(),
    block_number: z.string(),
    apy: z.object({
      value: z.string(),
      type: z.string(),
    }),
  }),
);
export type MetavaultChartFetchedData = z.infer<
  typeof METAVAULT_CHART_DATA_SCHEMA
>;

export const METAVAULT_CURRENT_DATA_SCHEMA = z.object({
  totalTvl: z.object({
    usd: z.string(),
    amount: z.string(),
    decimals: z.number(),
    usd_decimals: z.number(),
  }),
  lastUpdate: UNIX_TIMESTAMP_SCHEMA,
});
export type MetavaultCurrentData = z.infer<
  typeof METAVAULT_CURRENT_DATA_SCHEMA
>;

export const fetchMetavaultCurrentData = async (vaultAddress: string) => {
  const endpoint = `${METAVAULT_CHART_ORIGIN}/v1/chain/${CHAINS.Mainnet}/core-vaults/${vaultAddress}/data`;
  const data = await standardFetcher<unknown>(endpoint);

  return METAVAULT_CURRENT_DATA_SCHEMA.parse(data);
};

export const fetchMetavaultChartData = async (
  fromTimestamp: number,
  vaultAddress: string,
) => {
  const timestamp =
    fromTimestamp < TIMESTAMP_LAUNCH_DATE
      ? TIMESTAMP_LAUNCH_DATE
      : fromTimestamp;
  const METAVAULT_CHART_ENDPOINT = `${METAVAULT_CHART_ORIGIN}/v1/chain/${CHAINS.Mainnet}/core-vaults/${vaultAddress}/historical-data?from_timestamp=${timestamp}`;

  const data = await standardFetcher<MetavaultChartFetchedData>(
    METAVAULT_CHART_ENDPOINT,
  );
  return METAVAULT_CHART_DATA_SCHEMA.parse(data);
};
