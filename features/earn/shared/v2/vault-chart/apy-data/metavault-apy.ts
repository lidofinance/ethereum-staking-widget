import * as z from 'zod';

import { CHAINS } from 'consts/chains';
import { standardFetcher } from 'utils/standardFetcher';

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
  try {
    // TODO: Change to production endpoint
    const METAVAULT_CHART_ENDPOINT = `https://api.stage.mellow.finance/v1/chain/${CHAINS.Mainnet}/core-vaults/${vaultAddress}/historical-data?from_timestamp=${fromTimestamp}`;

    const data = await standardFetcher<MetavaultChartFetchedData>(
      METAVAULT_CHART_ENDPOINT,
    );
    const chartData = METAVAULT_CHART_DATA_SCHEMA.parse(data);

    return chartData;
  } catch (error) {
    console.error('Error fetching Metavault chart data:', error);
    return null;
  }
};
