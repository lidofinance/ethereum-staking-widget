import { z } from 'zod';
import { Address } from 'viem';

import { standardFetcher } from 'utils/standardFetcher';
import { CHAINS } from 'consts/chains';

import { METAVAULT_CHART_ORIGIN } from '../consts';

const API_IDENTIFIER_SCHEMA = z
  .string()
  .trim()
  .min(1)
  .transform((value) => value.toLowerCase());

const UNSIGNED_INTEGER_STRING_SCHEMA = z.string().regex(/^\d+$/u);
const DECIMALS_SCHEMA = z.number().int().min(0).max(255);

const ALLOCATION_CATEGORY_SCHEMA = API_IDENTIFIER_SCHEMA.pipe(
  z.enum(['token', 'protocol', 'pending-deposits', 'other']),
);

type AllocationMetadata = {
  category: z.infer<typeof ALLOCATION_CATEGORY_SCHEMA>;
  protocol?: string;
};

const requireProtocolForProtocolCategory = (
  value: AllocationMetadata,
  context: z.RefinementCtx,
) => {
  if (value.category === 'protocol' && !value.protocol) {
    context.addIssue({
      code: 'custom',
      path: ['protocol'],
      message: 'protocol is required when category is protocol',
    });
  }
};

const NESTED_ALLOCATION_SCHEMA = z
  .object({
    sharePercent: z.number(),
    chain: API_IDENTIFIER_SCHEMA,
    label: z.string(),
    id: z.string(),
    category: ALLOCATION_CATEGORY_SCHEMA,
    protocol: API_IDENTIFIER_SCHEMA.optional(),
  })
  .superRefine(requireProtocolForProtocolCategory);

export const METAVAULTS_ALLOCATION_DATA_SCHEMA = z.object({
  allocations: z.array(
    z
      .object({
        tvl: z.object({
          asset: z.string(),
          amount: UNSIGNED_INTEGER_STRING_SCHEMA,
          decimals: DECIMALS_SCHEMA,
          usd: UNSIGNED_INTEGER_STRING_SCHEMA,
          usd_decimals: DECIMALS_SCHEMA,
        }),
        type: z.string().optional().default(''),
        id: z.string(),
        label: z.string(),
        sharePercent: z.number(),
        chain: API_IDENTIFIER_SCHEMA,
        category: ALLOCATION_CATEGORY_SCHEMA,
        protocol: API_IDENTIFIER_SCHEMA.optional(),
        allocations: z.array(NESTED_ALLOCATION_SCHEMA).optional().default([]),
      })
      .superRefine(requireProtocolForProtocolCategory),
  ),
  lastUpdate: z.string(),
  totalTvl: z.object({
    usd: UNSIGNED_INTEGER_STRING_SCHEMA,
    usd_decimals: DECIMALS_SCHEMA,
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
