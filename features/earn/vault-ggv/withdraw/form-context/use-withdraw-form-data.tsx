import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useDappStatus } from 'modules/web3';
import { ETH_VAULT_QUERY_SCOPE } from 'features/earn/vault-eth/consts';

import { useGGVPosition } from '../../hooks/use-ggv-position';
import { useGGVBulkWithdrawEnabled } from '../../hooks/use-ggv-bulk-withdraw-enabled';
import { useGGVWithdrawalRequests } from '../hooks/use-ggv-withdrawal-requests';
import { useGGVWithdrawalState } from '../hooks/use-ggv-withdrawal-state';
import { useGGVBulkWithdrawalState } from '../hooks/use-ggv-bulk-withdrawal-state';

import type {
  GGVWithdrawalFormAsyncValidationContext,
  GGVWithdrawalFormValidationContext,
  GGVWithdrawalState,
} from '../types';
import { useGGVUserShareState } from '../hooks/use-ggv-shares-state';
import { useIsUnlocked } from '../hooks/use-is-unlocked';

export const useGGVWithdrawFormData = () => {
  const queryClient = useQueryClient();
  const { isDappActive } = useDappStatus();
  const balanceQuery = useGGVPosition();
  const isBulkWithdraw = useGGVBulkWithdrawEnabled();
  const withdrawalStateQuery = useGGVWithdrawalState(!isBulkWithdraw);
  const bulkWithdrawalStateQuery = useGGVBulkWithdrawalState(isBulkWithdraw);
  const withdrawalRequestsQuery = useGGVWithdrawalRequests();
  const shareStateQuery = useGGVUserShareState();

  const areSharesTimeLocked = useIsUnlocked(
    Number(shareStateQuery.data?.shareUnlockTime ?? 0),
  );

  // Both modes give the same base fields: canWithdraw, reason, limits
  const { data: withdrawalData, isLoading: isWithdrawalLoading } =
    isBulkWithdraw ? bulkWithdrawalStateQuery : withdrawalStateQuery;
  const { data: shareData, isLoading: isShareLoading } = shareStateQuery;

  const withdrawalState = useMemo<GGVWithdrawalState>(() => {
    if (isWithdrawalLoading || isShareLoading) {
      return {
        isLoading: true,
        reason: null,
        canWithdraw: true,
      };
    }

    if (withdrawalData?.canWithdraw === false) {
      return {
        isLoading: false,
        reason: withdrawalData.reason,
        canWithdraw: withdrawalData.canWithdraw,
      };
    }

    if (shareData?.denyFrom === true) {
      return {
        isLoading: false,
        reason: 'transfer-from-shares-blocked',
        canWithdraw: false,
      };
    }

    if (areSharesTimeLocked) {
      return {
        isLoading: false,
        reason: 'transfer-from-shares-time-locked',
        canWithdraw: false,
        unlockTime: shareData?.shareUnlockTime
          ? new Date(Number(shareData?.shareUnlockTime) * 1000)
          : undefined,
      };
    }

    return {
      isLoading: false,
      reason: null,
      canWithdraw: true,
    };
  }, [
    isWithdrawalLoading,
    isShareLoading,
    withdrawalData,
    shareData,
    areSharesTimeLocked,
  ]);

  const validationAsyncContextValue = useMemo<
    GGVWithdrawalFormAsyncValidationContext | undefined
  >(() => {
    if (!balanceQuery.data || !withdrawalData) {
      return undefined;
    }

    return {
      balance: balanceQuery.data.sharesBalance,
      maxWithdrawal: withdrawalData.withdrawCapacity,
      minWithdrawal: withdrawalData.minimumShares,
    };
  }, [balanceQuery.data, withdrawalData]);

  const asyncContext = useAwaiter(validationAsyncContextValue).awaiter;

  const validationContext: GGVWithdrawalFormValidationContext = {
    asyncContext,
    isWalletActive: isDappActive,
  };

  const refetchData = useCallback(() => {
    const options = { cancelRefetch: true, throwOnError: false };

    return Promise.all([
      balanceQuery.refetch(options),
      // refetch all GGV related queries
      queryClient.refetchQueries({ queryKey: ['ggv'] }, options),
      queryClient.refetchQueries(
        { queryKey: [ETH_VAULT_QUERY_SCOPE] },
        options,
      ),
    ]);
  }, [balanceQuery, queryClient]);

  return {
    // until this is loaded we cannot activate form
    // because we need to show either form or request state
    isLoadingFormState:
      withdrawalRequestsQuery.isLoading || withdrawalState.isLoading,
    withdrawalStateQuery,
    bulkWithdrawalStateQuery,
    isBulkWithdraw,
    withdrawalRequestsQuery,
    withdrawalState,
    validationContext,
    refetchData,
  };
};
