import { z } from 'zod';
import { isAddress } from 'viem';

// MAX_LIMIT: 10× UI page size (PAGE_ITEMS=10 in features/rewards/constants.ts).
// MAX_SKIP:  ~10k pages — well above any realistic UI deep-paging.
// .strict() below rejects unknown keys (keeps the cache keyspace bounded).
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
