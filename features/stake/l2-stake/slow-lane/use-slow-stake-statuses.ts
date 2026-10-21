import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Address, Hash } from 'viem';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import {
  L2_SLOW_STAKE_OUTCOME,
  L2_SLOW_STAKE_STAGE,
  LIDO_L2_STAKING_QUERY_SCOPE,
  getCcipExplorerMessageUrl,
  type L2SlowStakeLatest,
  type L2SlowStakeStatus,
} from 'modules/l2-staking';
import { useDappStatus, useLidoSDKL2 } from 'modules/web3';

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
  outcome: L2_SLOW_STAKE_OUTCOME.inflight,
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

const EMPTY: L2SlowStakeLatest = {
  inflight: [],
  error: [],
  success: [],
  hasMore: false,
};

// what the source lists, with the browser's own pending stakes merged in
type SlowStakeStatusesView = L2SlowStakeLatest & {
  // pending stakes the sources now list, so their placeholders can go
  settled: Hash[];
};

const EMPTY_VIEW: SlowStakeStatusesView = { ...EMPTY, settled: [] };

// The user's newest slow stakes on the current L2 as three stacks, by what
// each asks of the user: in flight, in error, succeeded. Found through the
// CCIP API, which attributes a message to the account that signed it, so a
// smart account's sends (signed by its bundler) are not found; the
// alternative, a scan of the sender's events, needs historic eth_getLogs
// that few RPCs serve reliably, so it is not used. Polled lazily: a stake
// takes the better part of an hour to move through its stages, and each
// refresh costs a list page plus a few L1 and L2 reads per shown stake
export const useSlowStakeStatuses = ({
  limit = DEFAULT_SLOW_STAKE_STATUSES_LIMIT,
}: UseSlowStakeStatusesArgs = {}) => {
  const { address, isDappActive } = useDappStatus();
  const { l2Stake, isL2Stake, chainId } = useLidoSDKL2();

  // Stakes sent from this browser that the source does not list yet stand
  // in front of the in-flight stack at their first stage; one the source
  // does list is shown from it and reported as settled, to be forgotten here
  const pending = usePendingSlowStakes({ chainId, address });
  const select = useCallback(
    (latest: L2SlowStakeLatest): SlowStakeStatusesView => {
      const listed = new Set(
        [...latest.inflight, ...latest.error, ...latest.success].map(
          (status) => status.messageId,
        ),
      );
      const settled: Hash[] = [];
      const placeholders: L2SlowStakeStatus[] = [];
      for (const entry of pending) {
        if (listed.has(entry.messageId)) settled.push(entry.messageId);
        else placeholders.push(toSentStatus(entry));
      }
      return {
        ...latest,
        inflight: [...placeholders, ...latest.inflight],
        settled,
      };
    },
    [pending],
  );

  const query = useQuery({
    queryKey: [
      LIDO_L2_STAKING_QUERY_SCOPE,
      'slow-stake-statuses',
      { chainId, address, limit },
    ],
    enabled: isL2Stake && isDappActive && !!address,
    ...STRATEGY_LAZY,
    queryFn: async (): Promise<L2SlowStakeLatest> => {
      if (!address) return EMPTY;
      return l2Stake.getLatestSlowStakeStatusesFromCcipApi({
        account: address,
        limit,
      });
    },
    select,
  });

  const { inflight, error, success, hasMore, settled } =
    query.data ?? EMPTY_VIEW;

  useEffect(() => {
    for (const messageId of settled) removePendingSlowStake(messageId);
  }, [settled]);

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
    inflight,
    error,
    success,
    hasMore,
    isLoading: query.isLoading,
    lookupError: query.error,
    refetch: query.refetch,
    addSlowStakeMessageId,
  };
};
