import * as z from 'zod';

import { CHAINS } from 'consts/chains';
import { standardFetcher } from 'utils/standardFetcher';

import { METAVAULT_CHART_ORIGIN } from '../consts';

// We need to cut off data before 7 March 2026 because the API returns incorrect data for that period.
const TIMESTAMP_7_MARCH_2026 = 1772841600;

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

export const fetchMetavaultChartData = async (
  fromTimestamp: number,
  vaultAddress: string,
) => {
  const timestamp =
    fromTimestamp < TIMESTAMP_7_MARCH_2026
      ? TIMESTAMP_7_MARCH_2026
      : fromTimestamp;
  const METAVAULT_CHART_ENDPOINT = `${METAVAULT_CHART_ORIGIN}/v1/chain/${CHAINS.Mainnet}/core-vaults/${vaultAddress}/historical-data?from_timestamp=${timestamp}`;

  const data = await standardFetcher<MetavaultChartFetchedData>(
    METAVAULT_CHART_ENDPOINT,
  );
  const chartData = METAVAULT_CHART_DATA_SCHEMA.parse(data);

  return chartData;
};
