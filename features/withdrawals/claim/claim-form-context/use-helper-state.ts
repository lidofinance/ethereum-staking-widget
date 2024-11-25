import { useEffect, useState } from 'react';
import { type UseFormWatch } from 'react-hook-form';

import { RequestStatusClaimable } from 'features/withdrawals/types/request-status';

import { ClaimFormInputType } from './types';

export type ClaimFormHelperState = {
  selectedRequests: RequestStatusClaimable[];
  ethToClaim: bigint;
  canSelectMore: boolean;
  requestsCount: number;
};

const initState = (): ClaimFormHelperState => ({
  selectedRequests: [],
  canSelectMore: true,
  ethToClaim: 0n,
  requestsCount: 0,
});

/// subscribes to form updates and provides derived helper state for UI
export const useHelperState = (
  watch: UseFormWatch<ClaimFormInputType>,
  maxSelectedRequestCount: number,
) => {
  const [helperState, setHelperState] =
    useState<ClaimFormHelperState>(initState);

  useEffect(() => {
    const subscription = watch(({ requests }) => {
      const selectedRequests =
        requests
          ?.filter((r) => r?.checked)
          .map((r) => r?.status as RequestStatusClaimable) ?? [];

      const ethToClaim = selectedRequests.reduce((ethSum, request) => {
        return ethSum + (request?.claimableEth ?? 0n);
      }, 0n);

      setHelperState({
        selectedRequests,
        canSelectMore: selectedRequests.length < maxSelectedRequestCount,
        requestsCount: requests?.length ?? 0,
        ethToClaim,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, maxSelectedRequestCount]);

  return helperState;
};
