import { z } from 'zod';
import { Address } from 'viem';

import { standardFetcher } from 'utils/standardFetcher';
import { CHAINS } from 'consts/chains';

import { METAVAULT_CHART_ORIGIN } from '../consts';

export const METAVAULTS_ALLOCATION_DATA_SCHEMA = z.object({
  allocations: z.array(
    z.object({
      tvl: z.object({
        asset: z.string(),
        amount: z.string(),
        decimals: z.number(),
        usd: z.string(),
        usd_decimals: z.number(),
      }),
      type: z.string().optional().default(''),
      id: z.string(),
      label: z.string(),
      sharePercent: z.number(),
      chain: z.string(),
      allocations: z
        .array(
          z.object({
            sharePercent: z.number(),
            chain: z.string(),
            label: z.string(),
            id: z.string(),
          }),
        )
        .optional()
        .default([]),
    }),
  ),
  lastUpdate: z.string(),
  totalTvl: z.object({
    usd: z.string(),
    usd_decimals: z.number(),
  }),
});
export type MetavaultsAllocationFetchedData = z.infer<
  typeof METAVAULTS_ALLOCATION_DATA_SCHEMA
>;

export const fetchMetavaultsAllocationData = async (
  vaultAddress?: Address,
): Promise<MetavaultsAllocationFetchedData> => {
  try {
    const METAVAULT_CHART_ENDPOINT = `${METAVAULT_CHART_ORIGIN}/v1/chain/${CHAINS.Mainnet}/core-vaults/${vaultAddress}/data`;

    const data = await standardFetcher<MetavaultsAllocationFetchedData>(
      METAVAULT_CHART_ENDPOINT,
    );
    const chartData = METAVAULTS_ALLOCATION_DATA_SCHEMA.parse(data);

    return chartData;
  } catch (error) {
    console.error(
      `[METAVAULTS_ALLOCATION_DATA] Error fetching metavault allocation data ${vaultAddress}`,
      error,
    );
    throw error;
  }
};
