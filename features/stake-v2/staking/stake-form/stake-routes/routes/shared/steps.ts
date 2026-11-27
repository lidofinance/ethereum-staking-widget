/**
 * The steps of a stake tx flow: a WETH preparation (unwrap on L1, approve
 * on L2) when needed, then the stake itself, always last
 */
export const STAKE_STEP = {
  unwrap: 'unwrap',
  approve: 'approve',
  stake: 'stake',
} as const;
