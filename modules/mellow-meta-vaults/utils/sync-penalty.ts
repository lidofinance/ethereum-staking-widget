import invariant from 'tiny-invariant';

export const PENALTY_D6_DENOMINATOR = 1_000_000n;

/**
 * Mirrors how Mellow sync queues apply `penaltyD6` (6-decimal fraction, capped
 * at 50% on-chain). SyncDepositQueue scales the report price by
 * (1e6 - penaltyD6) / 1e6 before minting; SyncRedeemQueue scales the redeemed
 * shares by the same factor before pricing them. The Collector quote ignores
 * the penalty, so it has to be applied on top; the result may differ from
 * on-chain execution by integer rounding only.
 */
export const applySyncPenaltyD6 = (amount: bigint, penaltyD6: bigint) => {
  invariant(
    penaltyD6 >= 0n && penaltyD6 <= PENALTY_D6_DENOMINATOR,
    `penaltyD6 out of range: ${penaltyD6}`,
  );
  return (
    (amount * (PENALTY_D6_DENOMINATOR - penaltyD6)) / PENALTY_D6_DENOMINATOR
  );
};
