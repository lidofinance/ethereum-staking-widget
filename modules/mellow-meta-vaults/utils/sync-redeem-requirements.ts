/**
 * Checks whether there are enough funds to use the sync queue.
 *
 * The daily limit is denominated in vault shares, while liquid assets use the
 * output token decimals (wstETH for EarnETH, USDC for EarnUSD). The sync queue
 * can be used only when the requested shares do not exceed the remaining daily
 * limit and the corresponding requested assets do not exceed the available
 * liquid assets. Otherwise, the redemption must use the async queue.
 *
 * The Collector's own verdict comes first: a paused sync queue quotes
 * `isWithdrawalPossible=false` with zero assets, which would otherwise pass
 * the asset comparison trivially.
 */
export const meetsSyncRedeemRequirements = ({
  isWithdrawalPossible,
  requestedShares,
  requestedAssets,
  remainingDailyLimit,
  liquidAssets,
}: {
  isWithdrawalPossible: boolean;
  requestedShares: bigint;
  requestedAssets: bigint;
  remainingDailyLimit: bigint;
  liquidAssets: bigint;
}) =>
  isWithdrawalPossible &&
  requestedAssets > 0n &&
  requestedShares <= remainingDailyLimit &&
  requestedAssets <= liquidAssets;
