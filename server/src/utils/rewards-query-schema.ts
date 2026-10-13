import { z } from 'zod';
import { isAddress } from 'viem';

/**
 * Verbatim port of `utilsApi/rewards-query-schema.ts` (incl. viem
 * `isAddress` — the checksum-aware check; the previous PoC port relaxed
 * this to a bare regex).
 *
 * MAX_LIMIT: 10× UI page size (PAGE_ITEMS=10 in features/rewards/constants.ts).
 * MAX_SKIP:  ~10k pages — well above any realistic UI deep-paging.
 * .strict() rejects unknown keys (keeps the cache keyspace bounded —
 * defense-in-depth on top of the proxy's allowedQueryParams whitelist).
 */
export const MAX_LIMIT = 100;
export const MAX_SKIP = 100_000;

export const rewardsQuerySchema = z
  .object({
    address: z.string().refine(isAddress, 'invalid address'),
    currency: z.string().max(8).optional(),
    skip: z.coerce.number().int().min(0).max(MAX_SKIP).optional(),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional(),
    archiveRate: z.coerce.boolean().optional(),
    onlyRewards: z.coerce.boolean().optional(),
  })
  .strict();

export const REWARDS_ALLOWED_QUERY_PARAMS = [
  'address',
  'currency',
  'skip',
  'limit',
  'archiveRate',
  'onlyRewards',
];
