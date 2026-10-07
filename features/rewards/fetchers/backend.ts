import { config } from 'config';
import { z } from 'zod';
import { ADDRESS_SCHEMA, BIGINT_STRING_SCHEMA, HASH_SCHEMA } from 'utils/zod';
import { standardFetcher } from 'utils/standardFetcher';

export type BackendQuery = {
  address: string;
  currency?: string;
  skip?: number;
  limit?: number;
  archiveRate?: boolean;
  onlyRewards?: boolean;
};

// Single source of truth for the /api/rewards response. Both the legacy
// reward-history-backend and the lido-rewards-indexer compat route are
// accepted; fields only one of them emits are optional/nullable.
// Numeric values stay strings: wei amounts feed `BigInt`/`parseEther`, and a
// `Number` round trip breaks past 2^53 and rejects at 1e21 (exponent notation)

// Signed integer string, e.g. a wei delta that goes negative on a negative rebase
const INTEGER_STRING_SCHEMA = z
  .string()
  .regex(/^-?\d+$/u, { message: 'Expected an integer string' });

// Finite decimal string consumed via `Number()` (APR, fiat, epoch days). The
// backend serializes these from BigDecimal, which may use exponent notation
const DECIMAL_STRING_SCHEMA = z
  .string()
  .regex(/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/u, {
    message: 'Expected a decimal string',
  });

// Fiat amount; empty when the backend has no price feed configured
const FIAT_STRING_SCHEMA = z.union([z.literal(''), DECIMAL_STRING_SCHEMA]);

const DIRECTION_SCHEMA = z.enum(['in', 'out']);

// Fields the backend computes for every event
const EVENT_BASE_SCHEMA = z.object({
  change: INTEGER_STRING_SCHEMA,
  balance: BIGINT_STRING_SCHEMA,
  currencyChange: FIAT_STRING_SCHEMA,
  block: BIGINT_STRING_SCHEMA,
  blockTime: BIGINT_STRING_SCHEMA,
  logIndex: BIGINT_STRING_SCHEMA,
  // Legacy backend only
  epochDays: DECIMAL_STRING_SCHEMA.optional(),
  epochFullDays: BIGINT_STRING_SCHEMA.optional(),
});

// Oracle report as indexed by the legacy backend's subgraph
export const TOTAL_REWARD_SCHEMA = z.object({
  id: z.string(),
  totalPooledEtherBefore: BIGINT_STRING_SCHEMA,
  totalPooledEtherAfter: BIGINT_STRING_SCHEMA,
  totalSharesBefore: BIGINT_STRING_SCHEMA,
  totalSharesAfter: BIGINT_STRING_SCHEMA,
});

// stETH transfer as indexed by the legacy backend's subgraph
export const LIDO_TRANSFER_SCHEMA = z.object({
  from: ADDRESS_SCHEMA,
  to: ADDRESS_SCHEMA,
  value: BIGINT_STRING_SCHEMA,
  shares: BIGINT_STRING_SCHEMA,
  sharesBeforeDecrease: BIGINT_STRING_SCHEMA,
  sharesAfterDecrease: BIGINT_STRING_SCHEMA,
  sharesBeforeIncrease: BIGINT_STRING_SCHEMA,
  sharesAfterIncrease: BIGINT_STRING_SCHEMA,
  totalPooledEther: BIGINT_STRING_SCHEMA,
  totalShares: BIGINT_STRING_SCHEMA,
  balanceAfterDecrease: BIGINT_STRING_SCHEMA,
  balanceAfterIncrease: BIGINT_STRING_SCHEMA,
  transactionIndex: BIGINT_STRING_SCHEMA,
});

// Rebase: the user's share of an oracle report
export const REWARD_EVENT_SCHEMA = EVENT_BASE_SCHEMA.extend({
  type: z.literal('reward'),
  direction: z.null().optional(),
  apr: DECIMAL_STRING_SCHEMA.nullable(),
  // Absent on the legacy backend, the report tx on the indexer
  transactionHash: HASH_SCHEMA.optional(),
  // Legacy backend only
  ...TOTAL_REWARD_SCHEMA.partial().shape,
  reportShares: BIGINT_STRING_SCHEMA.optional(),
  rewards: INTEGER_STRING_SCHEMA.optional(),
});

// Transfer-based events: a stake (mint from zero address), a plain transfer,
// or a withdrawal request (transfer to the withdrawal queue)
export const TRANSFER_EVENT_SCHEMA = EVENT_BASE_SCHEMA.extend({
  type: z.enum(['staking', 'transfer', 'withdrawal']),
  direction: DIRECTION_SCHEMA,
  apr: z.null().optional(),
  transactionHash: HASH_SCHEMA,
  // Legacy backend only
  ...LIDO_TRANSFER_SCHEMA.partial().shape,
});

export const EVENT_SCHEMA = z.discriminatedUnion('type', [
  REWARD_EVENT_SCHEMA,
  TRANSFER_EVENT_SCHEMA,
]);

export const BACKEND_SCHEMA = z.object({
  events: z.array(EVENT_SCHEMA),
  totals: z.object({
    // Sum of reward changes in wei; rendered through `formatWEI`
    ethRewards: INTEGER_STRING_SCHEMA,
    currencyRewards: FIAT_STRING_SCHEMA,
  }),
  averageApr: DECIMAL_STRING_SCHEMA,
  // Null on the indexer when no price feed is configured
  ethToStEthRatio: z.number().nullable(),
  stETHCurrencyPrice: z.record(z.string(), z.number()),
  totalItems: z.number().int().nonnegative(),
});

export const backendRequest = async (
  query: BackendQuery,
  fetcherParams?: Parameters<typeof standardFetcher>[1],
) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([k, v]) => params.append(k, v.toString()));

  let apiRewardsUrl;
  if (config.ipfsMode) {
    apiRewardsUrl = `${config.rewardsBackendBasePath}?${params.toString()}`;
  } else {
    apiRewardsUrl = `/api/rewards?${params.toString()}`;
  }

  const json = await standardFetcher(apiRewardsUrl, fetcherParams);

  return BACKEND_SCHEMA.parse(json);
};
