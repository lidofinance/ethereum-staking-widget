import type { TOTAL_REWARD_SCHEMA } from '../fetchers/backend';
import type { z } from 'zod';

export type TotalReward = z.infer<typeof TOTAL_REWARD_SCHEMA>;
