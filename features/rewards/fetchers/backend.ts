import { config } from 'config';
import { z } from 'zod';
import type { Backend } from 'features/rewards/types';
import { NUMERIC_SCHEMA } from 'utils/zod';

export type BackendQuery = {
  address: string;
  currency?: string;
  skip?: number;
  limit?: number;
  archiveRate?: boolean;
  onlyRewards?: boolean;
};

// Validates the shape the table relies on; event rows carry many optional
// fields that pass through untouched
export const BACKEND_SCHEMA = z.object({
  events: z.array(
    z.looseObject({
      type: z.string(),
      change: z.string(),
      balance: z.string(),
      blockTime: z.string(),
      transactionHash: z.string(),
    }),
  ),
  // The backend serializes both totals as numeric strings
  totals: z.object({
    ethRewards: NUMERIC_SCHEMA,
    currencyRewards: NUMERIC_SCHEMA,
  }),
  averageApr: z.string(),
  ethToStEthRatio: z.number(),
  stETHCurrencyPrice: z.record(z.string(), z.number()),
  totalItems: z.number(),
});

export const backendRequest = async (query: BackendQuery) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([k, v]) => params.append(k, v.toString()));

  let apiRewardsUrl;
  if (config.ipfsMode) {
    apiRewardsUrl = `${config.rewardsBackendBasePath}?${params.toString()}`;
  } else {
    apiRewardsUrl = `/api/rewards?${params.toString()}`;
  }

  const requested = await fetch(apiRewardsUrl);

  if (!requested.ok) {
    const responded = await requested.json();
    throw new Error(responded?.message ?? requested.statusText);
  }

  return BACKEND_SCHEMA.parse(await requested.json()) as Backend;
};
