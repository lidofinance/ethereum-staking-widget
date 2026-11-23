import type { ClientLimits } from './client-limit';

export type UpstreamBudget = {
  maxCallsPerMinute: number;
  maxCallsPerHour: number;
  maxCallsPerDay: number;
};

// upstream calls one pod may make; every pod counts on its own
export const UPSTREAM_BUDGETS: Record<
  'positions' | 'history' | 'rewards',
  UpstreamBudget
> = {
  positions: {
    maxCallsPerMinute: 300,
    maxCallsPerHour: 1200,
    maxCallsPerDay: 9500,
  },
  history: {
    maxCallsPerMinute: 120,
    maxCallsPerHour: 800,
    maxCallsPerDay: 6400,
  },
  rewards: {
    maxCallsPerMinute: 60,
    maxCallsPerHour: 200,
    maxCallsPerDay: 1600,
  },
};

// per client IP, pod and day; a person looks at a few wallets a few times
export const CLIENT_LIMITS: ClientLimits = {
  addresses: 20,
  positions: 200,
  history: 100,
  rewards: 40,
};
