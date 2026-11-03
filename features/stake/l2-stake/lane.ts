export const L2_STAKE_LANE = { fast: 'fast', slow: 'slow' } as const;
export type L2StakeLane = (typeof L2_STAKE_LANE)[keyof typeof L2_STAKE_LANE];

type ResolveL2StakeLaneArgs = {
  amount: bigint | null;
  // the ETH the fast lane's pool can take right now; undefined while unknown
  fastLaneLiquidity: bigint | undefined;
  isFastLaneAvailable: boolean;
  isSlowLaneAvailable: boolean;
};

// The lane an amount goes to. At or below the pool's liquidity it is swapped
// on the L2 (fast); above it, it is sent to Ethereum (slow), up to the slow
// lane's own limit, which its validation enforces. A lane that is not offered
// hands over to the other. Unknown inputs resolve to the fast lane, so no
// amount is routed to Ethereum on missing data. The form and its validation
// both resolve the lane here, so what the form shows is what it validates
// and sends
export const resolveL2StakeLane = ({
  amount,
  fastLaneLiquidity,
  isFastLaneAvailable,
  isSlowLaneAvailable,
}: ResolveL2StakeLaneArgs): L2StakeLane => {
  if (!isSlowLaneAvailable) return L2_STAKE_LANE.fast;
  if (!isFastLaneAvailable) return L2_STAKE_LANE.slow;
  if (amount === null || fastLaneLiquidity === undefined)
    return L2_STAKE_LANE.fast;
  return amount <= fastLaneLiquidity ? L2_STAKE_LANE.fast : L2_STAKE_LANE.slow;
};
