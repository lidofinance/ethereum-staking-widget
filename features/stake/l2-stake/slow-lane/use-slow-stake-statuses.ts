import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Address, Hash } from 'viem';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import {
  L2_SLOW_STAKE_STAGE,
  LIDO_L2_SLOW_STAKE_LOOKBACK_BLOCKS,
  LIDO_L2_STAKING_QUERY_SCOPE,
  getCcipExplorerMessageUrl,
  type L2SlowStakeLatest,
  type L2SlowStakeStatus,
} from 'modules/l2-staking';
import { useDappStatus, useIsSmartAccount, useLidoSDKL2 } from 'modules/web3';

import {
  addPendingSlowStake,
  removePendingSlowStake,
  usePendingSlowStakes,
  type PendingSlowStake,
} from './slow-stake-pending-store';

// what a just-sent stake is known by before the API lists it
export type SlowStakeMessageIdArgs = {
  messageId: Hash;
  token: Address;
  amount: bigint;
  sendTxHash?: Hash;
  sendBlockNumber?: bigint;
};

// the stake as a status, at its first stage, until a source reports more
const toSentStatus = (pending: PendingSlowStake): L2SlowStakeStatus => ({
  stage: L2_SLOW_STAKE_STAGE.sent,
  messageId: pending.messageId,
  user: pending.address,
  token: pending.token,
  amount: pending.amount,
  sendTxHash: pending.sendTxHash ?? '0x',
  sendBlockNumber: pending.sendBlockNumber ?? 0n,
  ccipExplorerUrl: getCcipExplorerMessageUrl(pending.messageId),
});

type UseSlowStakeStatusesArgs = {
  // how many of the newest stakes to show; the rest is reported as hasMore
  limit?: number;
};

export const DEFAULT_SLOW_STAKE_STATUSES_LIMIT = 3;

const EMPTY: L2SlowStakeLatest = { statuses: [], hasMore: false };

// The user's newest slow stakes on the current L2 with where each one is,
// newest first. Ordinary wallets are found through the CCIP API, which
// attributes a message to the account that signed it; a smart account's
// sends are signed by its bundler, so those are found in the sender's
// events over the lane's lookback window instead. Polled lazily: a stake
// takes the better part of an hour to move through its stages, and each
// refresh costs a list page plus the L1 and L2 reads for every shown stake
export const useSlowStakeStatuses = ({
  limit = DEFAULT_SLOW_STAKE_STATUSES_LIMIT,
}: UseSlowStakeStatusesArgs = {}) => {
  const { address, isDappActive } = useDappStatus();
  const { l2Stake, isL2Stake, chainId } = useLidoSDKL2();
  const { isSmartAccount, isLoading: isSmartAccountLoading } =
    useIsSmartAccount();
  const source = isSmartAccount ? 'logs' : 'ccip-api';

  const query = useQuery({
    queryKey: [
      LIDO_L2_STAKING_QUERY_SCOPE,
      'slow-stake-statuses',
      { chainId, address, limit, source },
    ],
    enabled: isL2Stake && isDappActive && !!address && !isSmartAccountLoading,
    ...STRATEGY_LAZY,
    queryFn: async (): Promise<L2SlowStakeLatest> => {
      if (!address) return EMPTY;
      if (source === 'ccip-api') {
        return l2Stake.getLatestSlowStakeStatusesFromCcipApi({
          account: address,
          limit,
        });
      }
      const lookback = LIDO_L2_SLOW_STAKE_LOOKBACK_BLOCKS[chainId];
      if (lookback === undefined) return EMPTY;
      const toBlock = await l2Stake.core.publicClient.getBlockNumber();
      return l2Stake.getLatestSlowStakeStatuses({
        account: address,
        fromBlock: toBlock > lookback ? toBlock - lookback : 0n,
        toBlock,
        limit,
      });
    },
  });

  // Stakes sent from this browser that the sources do not list yet stand
  // in front of the list at their first stage; one the sources do list is
  // shown from them and forgotten here
  const pending = usePendingSlowStakes({ chainId, address });
  const listed = query.data?.statuses;
  const { statuses, hasMore } = useMemo(() => {
    const fromSources = listed ?? [];
    const placeholders = pending
      .filter(
        (entry) =>
          !fromSources.some((status) => status.messageId === entry.messageId),
      )
      .map(toSentStatus);
    const merged: L2SlowStakeStatus[] = [...placeholders, ...fromSources];
    return {
      statuses: merged.slice(0, limit),
      hasMore: (query.data?.hasMore ?? false) || merged.length > limit,
    };
  }, [pending, listed, limit, query.data?.hasMore]);

  useEffect(() => {
    if (!listed) return;
    for (const entry of pending) {
      if (listed.some((status) => status.messageId === entry.messageId))
        removePendingSlowStake(entry.messageId);
    }
  }, [pending, listed]);

  // Called by the stake flow with the id its receipt carries, so the stake
  // shows at once instead of after the API's delay
  const addSlowStakeMessageId = useCallback(
    (args: SlowStakeMessageIdArgs) => {
      if (!address) return;
      addPendingSlowStake({ ...args, chainId, address });
    },
    [chainId, address],
  );

  return {
    statuses,
    hasMore,
    source,
    isLoading: query.isLoading || isSmartAccountLoading,
    error: query.error,
    refetch: query.refetch,
    addSlowStakeMessageId,
  };
};
