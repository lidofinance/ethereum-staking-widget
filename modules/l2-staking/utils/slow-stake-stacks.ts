import type { L2SlowStakeStacks, L2SlowStakeStatus } from '../types';

// Statuses by what they ask of the user: nothing yet, something, nothing
// any more. Each stack keeps the order it was handed
export const groupSlowStakeStatuses = (
  statuses: readonly L2SlowStakeStatus[],
): L2SlowStakeStacks => {
  const stacks: L2SlowStakeStacks = { inflight: [], error: [], success: [] };
  for (const status of statuses) stacks[status.outcome].push(status);
  return stacks;
};
