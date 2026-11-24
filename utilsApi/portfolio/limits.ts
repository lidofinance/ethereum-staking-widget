import type { ClientLimits } from './client-limit';

export type UpstreamBudget = {
  maxCallsPerMinute: number;
  maxCallsPerHour: number;
  maxCallsPerDay: number;
};

// upstream calls one pod may make; every pod counts on its own
// one quota pays for all three, and a rewards call weighs ten of the others
export const UPSTREAM_BUDGETS: Record<
  'positions' | 'history' | 'rewards',
  UpstreamBudget
> = {
  positions: {
    maxCallsPerMinute: 300,
    maxCallsPerHour: 650,
    maxCallsPerDay: 5000,
  },
  history: {
    maxCallsPerMinute: 120,
    maxCallsPerHour: 400,
    maxCallsPerDay: 3000,
  },
  rewards: {
    maxCallsPerMinute: 60,
    maxCallsPerHour: 100,
    maxCallsPerDay: 800,
  },
};

// per client IP, pod and day; a person looks at a few wallets a few times
export const CLIENT_LIMITS: ClientLimits = {
  addresses: 20,
  positions: 200,
  history: 100,
  rewards: 40,
};
