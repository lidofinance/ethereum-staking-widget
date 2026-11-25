import invariant from 'tiny-invariant';

import type {
  AsyncDepositQueueWritableContract,
  DepositQueueWritableContract,
  SyncDepositQueueWritableContract,
} from '../types/contracts';

type GetDepositRouteArgs = {
  // undefined for a token without a sync queue
  syncQueue?: SyncDepositQueueWritableContract;
  // only for a token without a sync queue
  asyncQueue?: AsyncDepositQueueWritableContract;
};

export type DepositRoute = {
  depositQueue: DepositQueueWritableContract;
  // the sync queue mints the shares at once; the async one takes a request
  // that a later oracle report settles
  isSyncQueue: boolean;
};

/**
 * The queue a new deposit goes to: the token's sync queue whenever it has one.
 * The sync queue mints at the report price less its `penaltyD6`; the quote
 * the form shows and the deposit is held to includes that penalty, see
 * readDepositQuote; a deposit with no quote displayed (an upgrade) does not go
 * while there is a penalty. Only a token without a sync queue deposits
 * through its async queue.
 */
export const getDepositRoute = ({
  syncQueue,
  asyncQueue,
}: GetDepositRouteArgs): DepositRoute => {
  if (syncQueue) return { depositQueue: syncQueue, isSyncQueue: true };
  invariant(asyncQueue, 'the token has no deposit queue');
  return { depositQueue: asyncQueue, isSyncQueue: false };
};
