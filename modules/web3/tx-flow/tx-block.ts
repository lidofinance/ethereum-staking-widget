import { type Address, isAddressEqual } from 'viem';

import { config } from 'config';

// Block numbers of different chains do not compare, and the reads a flow
// waits for are of its account's own state: another account's tx leaves them
export type TxBlockScope = { chainId: number; address: Address };

// the latest block a tx of the scope got into
export type TxBlock = TxBlockScope & { blockNumber: bigint };

export const isTxBlockOf = (block: TxBlock, scope: TxBlockScope) =>
  block.chainId === scope.chainId &&
  isAddressEqual(block.address, scope.address);

// The block to keep once a tx of `scope` got into `blockNumber`: the later of
// the two within a scope, the new one when the scope changed
export const recordTxBlock = (
  last: TxBlock | null,
  scope: TxBlockScope,
  blockNumber: bigint,
): TxBlock =>
  last && isTxBlockOf(last, scope) && last.blockNumber >= blockNumber
    ? last
    : { ...scope, blockNumber };

type WaitForBlockArgs = {
  // the number of the block the RPC treats as `latest`
  getLatestBlockNumber: () => Promise<bigint | null>;
  // the block the reads that follow must see
  blockNumber: bigint;
  // false once the flow went stale: nobody waits for the result any more
  isCurrent: () => boolean;
  timeout?: number;
  interval?: number;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Resolves once the RPC's `latest` block is `blockNumber` or later, so the
 * `latest` reads that follow see that block's state. Resolves with whether it
 * got there.
 *
 * Fail-open: a failed read, the timeout or a stale flow end the wait, and the
 * reads go ahead as they would without it. Never rejects.
 */
export const waitForBlock = async ({
  getLatestBlockNumber,
  blockNumber,
  isCurrent,
  timeout = config.TX_FLOW_PREV_BLOCK_TIMEOUT,
  interval = config.TX_FLOW_PREV_BLOCK_INTERVAL,
}: WaitForBlockArgs): Promise<boolean> => {
  const deadline = Date.now() + timeout;
  for (;;) {
    if (!isCurrent()) return false;
    try {
      const latest = await getLatestBlockNumber();
      if (latest !== null && latest >= blockNumber) return true;
    } catch (error) {
      console.warn('[waitForBlock] latest block read failed', error);
      return false;
    }
    const left = deadline - Date.now();
    if (left <= 0) {
      console.warn(`[waitForBlock] block ${blockNumber} not served in time`);
      return false;
    }
    await sleep(Math.min(interval, left));
  }
};
