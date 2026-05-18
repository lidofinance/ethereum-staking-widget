import { z } from 'zod';

/**
 * Query-parameter schema for `/api/rewards`.
 *
 * Bounds (`limit`, `skip`) are sized to the widget's own usage:
 * - UI paginates at `PAGE_ITEMS = 10` (features/rewards/constants.ts).
 * - CSV export issues a single `limit`-less request (relies on backend default).
 *
 * `MAX_LIMIT = 100` gives a 10× margin against UI growth while preventing
 * attacker-driven response inflation against the upstream rewards backend.
 * `.strict()` rejects unknown keys — defense-in-depth against query-string
 * padding attacks (separate from the cache-key whitelist).
 */
export const MAX_LIMIT = 100;
export const MAX_SKIP = 100_000;

export const rewardsQuerySchema = z
  .object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'invalid address'),
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
