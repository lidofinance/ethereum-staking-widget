/**
 * Checks whether the oracle report is fresh enough for the sync queue.
 *
 * Mirrors `SyncRedeemQueue.redeem`, which reverts with `StaleReport` when
 * `report.timestamp + maxAge < block.timestamp`. Mellow does not publish the
 * report at the same time every day, so a report can be stale for some time.
 * The Collector does not check this, so the frontend must do it.
 */
export const isReportFresh = ({
  reportTimestamp,
  maxAge,
  blockTimestamp,
}: {
  reportTimestamp: bigint;
  maxAge: bigint;
  blockTimestamp: bigint;
}) => reportTimestamp + maxAge >= blockTimestamp;
