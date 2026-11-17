import type {
  AsyncDepositQueueWritableContract,
  DepositQueueWritableContract,
  SyncDepositQueueWritableContract,
} from '../types/contracts';

type SelectDepositQueueArgs = {
  // undefined for a token without a sync queue
  syncQueue?: SyncDepositQueueWritableContract;
  asyncQueue: AsyncDepositQueueWritableContract;
};

export type DepositRoute = {
  depositQueue: DepositQueueWritableContract;
  // the sync queue mints the shares at once; the async one takes a request
  // that a later oracle report settles
  isSyncQueue: boolean;
};

/**
 * The queue a deposit goes to, read fresh for every deposit. The sync queue
 * mints at once, but it prices the deposit with its `penaltyD6` while the
 * async queue charges none: a non-zero sync penalty makes the async queue
 * cheaper, so route there.
 */
export const selectDepositQueue = async ({
  syncQueue,
  asyncQueue,
}: SelectDepositQueueArgs): Promise<DepositRoute> => {
  if (syncQueue) {
    const [penaltyD6] = await syncQueue.read.syncDepositParams();
    if (penaltyD6 === 0n) return { depositQueue: syncQueue, isSyncQueue: true };
  }
  return { depositQueue: asyncQueue, isSyncQueue: false };
};
