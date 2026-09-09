import { queryOptions } from '@tanstack/react-query';

import { overrideWithQAMockBigInt } from 'utils/qa';
import { COLLECTOR_CONFIG, MELLOW_VAULTS_QUERY_SCOPE } from '../consts';
import type {
  AsyncRedeemQueueContract,
  CollectorContract,
  SyncRedeemQueueContract,
} from '../types/contracts';
import { applySyncPenaltyD6 } from '../utils/sync-penalty';
import { meetsSyncRedeemRequirements } from '../utils/sync-redeem-requirements';

export const QA_REMAINING_DAILY_LIMIT_KEY =
  'mock-qa-helpers-mellow-sync-redeem-remaining-daily-limit';
export const QA_LIQUID_ASSETS_KEY =
  'mock-qa-helpers-mellow-sync-redeem-liquid-assets';
export const QA_SYNC_REDEEM_PENALTY_D6_KEY =
  'mock-qa-helpers-mellow-sync-redeem-penalty-d6';

export type WithdrawParams = {
  assets: bigint; // e.g. wstETH or USDC amount to receive from redeeming the shares
};

export type WithdrawRoute = 'sync' | 'async';

export type WithdrawQuote = {
  // Assets the user receives, net of the redeem fee and, on the sync route, the sync penalty
  assets: bigint;
  route: WithdrawRoute;
  // Sync route penalty in D6; 0n on the async route
  penaltyD6: bigint;
  // True when the instant route was checked and its limits definitively don't
  // cover the request. False on the sync route, for async-only queues, and
  // when the check itself failed (we fall back to async but can't say why).
  isInstantUnavailable: boolean;
};

// The user gets fewer assets than previewed
export const isWithdrawQuoteWorse = (
  fresh: WithdrawQuote,
  displayed: WithdrawQuote,
) => fresh.assets < displayed.assets;

type SyncRouteCheck =
  | { status: 'available'; assets: bigint; penaltyD6: bigint }
  | { status: 'unavailable' }
  | { status: 'unknown' };

type CheckSyncRouteArgs = {
  collector: CollectorContract;
  syncRedeemQueue: SyncRedeemQueueContract;
  shares: bigint;
};

const checkSyncRoute = async ({
  collector,
  syncRedeemQueue,
  shares,
}: CheckSyncRouteArgs): Promise<SyncRouteCheck> => {
  try {
    const [, actualRemainingDailyLimit] =
      await syncRedeemQueue.read.remainingDailyLimit();
    const remainingDailyLimit = overrideWithQAMockBigInt(
      actualRemainingDailyLimit,
      QA_REMAINING_DAILY_LIMIT_KEY,
    );

    // Eager return to save rpc calls, duplicates predicate from meetsSyncRedeemRequirements
    if (shares > remainingDailyLimit) return { status: 'unavailable' };

    const [{ assets }, actualLiquidAssets, [actualPenaltyD6]] =
      await Promise.all([
        collector.read.getWithdrawalParams([
          shares,
          syncRedeemQueue.address,
          COLLECTOR_CONFIG,
        ]) as Promise<WithdrawParams>,
        syncRedeemQueue.read.getLiquidAssets(),
        syncRedeemQueue.read.syncRedeemParams(),
      ]);
    const liquidAssets = overrideWithQAMockBigInt(
      actualLiquidAssets,
      QA_LIQUID_ASSETS_KEY,
    );
    const penaltyD6 = overrideWithQAMockBigInt(
      actualPenaltyD6,
      QA_SYNC_REDEEM_PENALTY_D6_KEY,
    );

    // Compared before the penalty: the contract checks the penalized amount
    // against liquidity, so this is the stricter (safe) side.
    if (
      !meetsSyncRedeemRequirements({
        requestedShares: shares,
        requestedAssets: assets,
        remainingDailyLimit,
        liquidAssets,
      })
    ) {
      return { status: 'unavailable' };
    }

    return {
      status: 'available',
      assets: applySyncPenaltyD6(assets, penaltyD6),
      penaltyD6,
    };
  } catch (error) {
    console.error(
      'Failed to check instant withdrawal availability, falling back to the async redeem queue',
      error,
    );
    return { status: 'unknown' };
  }
};

/**
 * Single source of truth for "which queue takes this withdrawal and how much
 * does it pay out". Used by the form preview (`useQuery`) and re-fetched by
 * the withdraw hook right before signing (`verifyQuote`), so the route and the
 * amount the user saw are the ones that get executed.
 *
 * Omit `syncRedeemQueue` for async-only queues and for valuing requests that
 * are already sitting in the async queue.
 */
export type GetWithdrawQuoteQueryOptionsArgs = {
  collector: CollectorContract;
  asyncRedeemQueue: AsyncRedeemQueueContract;
  syncRedeemQueue?: SyncRedeemQueueContract;
  shares: bigint | null | undefined;
};

export const getWithdrawQuoteQueryOptions = ({
  collector,
  asyncRedeemQueue,
  syncRedeemQueue,
  shares,
}: GetWithdrawQuoteQueryOptionsArgs) =>
  queryOptions({
    queryKey: [
      MELLOW_VAULTS_QUERY_SCOPE,
      'withdraw-quote',
      collector.address,
      asyncRedeemQueue.address,
      syncRedeemQueue?.address ?? null,
      { shares: shares ?? null },
    ] as const,
    queryFn: async (): Promise<WithdrawQuote> => {
      if (!shares) {
        return {
          assets: 0n,
          route: 'async',
          penaltyD6: 0n,
          isInstantUnavailable: false,
        };
      }

      const syncRoute = syncRedeemQueue
        ? await checkSyncRoute({ collector, syncRedeemQueue, shares })
        : null;

      if (syncRoute?.status === 'available') {
        return {
          assets: syncRoute.assets,
          route: 'sync',
          penaltyD6: syncRoute.penaltyD6,
          isInstantUnavailable: false,
        };
      }

      const { assets } = (await collector.read.getWithdrawalParams([
        shares,
        asyncRedeemQueue.address,
        COLLECTOR_CONFIG,
      ])) as WithdrawParams;

      return {
        assets,
        route: 'async',
        penaltyD6: 0n,
        isInstantUnavailable: syncRoute?.status === 'unavailable',
      };
    },
  });
