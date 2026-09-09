import { queryOptions } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import type { Abi, Address } from 'viem';

import { overrideWithQAMockBigInt } from 'utils/qa';
import { COLLECTOR_CONFIG, MELLOW_VAULTS_QUERY_SCOPE } from '../consts';
import type {
  CollectorContract,
  DepositQueueContract,
  SyncDepositQueueContract,
} from '../types/contracts';
import { applySyncPenaltyD6 } from '../utils/sync-penalty';

export const QA_SYNC_DEPOSIT_PENALTY_D6_KEY =
  'mock-qa-helpers-mellow-sync-deposit-penalty-d6';

export type DepositParams = {
  isDepositPossible: boolean;
  isDepositorWhitelisted: boolean;
  isMerkleProofRequired: boolean;
  asset: string; // address as hex string
  shares: bigint;
  sharesUSDC: bigint;
  assets: bigint;
  assetsUSDC: bigint;
  eta: bigint;
};

export type DepositQuote = {
  // Shares the depositor receives, net of the deposit fee and the sync penalty
  shares: bigint;
  // Sync queue penalty in D6; 0n for async queues
  penaltyD6: bigint;
};

// Async and sync deposit queues share the `deposit` signature, but only the sync
// queue applies `penaltyD6` to the report price. The contract getters build each
// queue with its own ABI, which is what distinguishes them at runtime.
export const isSyncDepositQueue = (
  queue: DepositQueueContract,
): queue is SyncDepositQueueContract =>
  (queue.abi as Abi).some(
    (item) => item.type === 'function' && item.name === 'syncDepositParams',
  );

const readSyncDepositPenaltyD6 = async (queue: DepositQueueContract) => {
  if (!isSyncDepositQueue(queue)) return 0n;
  const [penaltyD6] = await queue.read.syncDepositParams();
  return overrideWithQAMockBigInt(penaltyD6, QA_SYNC_DEPOSIT_PENALTY_D6_KEY);
};

// The user gets fewer shares than previewed
export const isDepositQuoteWorse = (
  fresh: DepositQuote,
  displayed: DepositQuote,
) => fresh.shares < displayed.shares;

type GetDepositQuoteQueryOptionsArgs = {
  collector: CollectorContract;
  depositQueue: DepositQueueContract;
  amount: bigint | null | undefined;
  account: Address | undefined;
};

/**
 * Single source of truth for "how many shares does this deposit mint".
 * Used by the form preview (`useQuery`) and re-fetched by the deposit hook
 * right before signing (`verifyQuote`), so both see the same number.
 */
export const getDepositQuoteQueryOptions = ({
  collector,
  depositQueue,
  amount,
  account,
}: GetDepositQuoteQueryOptionsArgs) =>
  queryOptions({
    queryKey: [
      MELLOW_VAULTS_QUERY_SCOPE,
      'deposit-quote',
      collector.address,
      depositQueue.address,
      { amount: amount ?? null, account: account ?? null },
    ] as const,
    queryFn: async (): Promise<DepositQuote> => {
      invariant(account, 'User address is not available');

      if (!amount) return { shares: 0n, penaltyD6: 0n };

      const [{ shares }, penaltyD6] = await Promise.all([
        collector.read.getDepositParams([
          depositQueue.address, // queue
          amount, // assets
          account, // account
          COLLECTOR_CONFIG, // config
        ]) as Promise<DepositParams>,
        readSyncDepositPenaltyD6(depositQueue),
      ]);

      return {
        shares: applySyncPenaltyD6(shares, penaltyD6),
        penaltyD6,
      };
    },
  });
