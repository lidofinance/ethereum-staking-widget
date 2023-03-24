import { FC, createContext, useMemo } from 'react';
import { BigNumber } from 'ethers';

import {
  useWithdrawalRequests,
  ClaimableRequestStatus,
  RequestStatus,
} from 'features/withdrawals/hooks';
import { useAsyncMemo } from 'shared/hooks/useAsyncMemo';

import { useClaimSelection } from './useClaimSelection';
import { useSetAllSelected } from './useSetAllSelected';

export const ClaimDataContext = createContext({} as ClaimDataValue);

type SelectableRequests = ClaimableRequestStatus[];

type Requests = (ClaimableRequestStatus | RequestStatus)[];

export type ClaimDataValue = {
  ethToClaim: BigNumber;
  requests: Requests;
  selectedRequests: SelectableRequests;
  withdrawalRequestsData: ReturnType<typeof useWithdrawalRequests>;
  claimSelection: ReturnType<typeof useClaimSelection>;
};

const ClaimDataProvider: FC = ({ children }) => {
  const withdrawRequests = useWithdrawalRequests();
  const claimSelection = useClaimSelection();

  // on initial loading set all claimable requests as selected
  useSetAllSelected({
    withdrawRequests,
    setSelectedMany: claimSelection.setSelectedMany,
  });

  // TODO: fix nasty chokepoint
  // find a way to calculate selectedRequests and ethToClaim
  // accumulatively on state change
  const fuzedState = useAsyncMemo(async () => {
    if (!withdrawRequests.data) return;
    let ethToClaim = BigNumber.from(0);
    // only relevant in claim mutation but we need ethToClaim anyway
    const selectedRequests: SelectableRequests = [];
    const requests = [
      ...(withdrawRequests.data?.sortedClaimableRequests.map((r) => {
        const isSelected = claimSelection.isSelected(r.stringId);
        if (isSelected) {
          ethToClaim = ethToClaim.add(r.claimableEth);
          selectedRequests.push(r);
        }
        return r;
      }) ?? []),
      ...(withdrawRequests.data?.pendingRequests ?? []),
    ];
    return { requests, ethToClaim, selectedRequests };
  }, [withdrawRequests.data, claimSelection.selectionState]);

  const loading = !fuzedState || withdrawRequests.initialLoading;

  const value: ClaimDataValue = useMemo(() => {
    return {
      withdrawalRequestsData: withdrawRequests,
      claimSelection,
      ...(fuzedState ?? {
        ethToClaim: BigNumber.from(0),
        requests: [],
        selectedRequests: [],
      }),
      loading,
    };
  }, [claimSelection, withdrawRequests, fuzedState, loading]);

  return (
    <ClaimDataContext.Provider value={value}>
      {children}
    </ClaimDataContext.Provider>
  );
};

export default ClaimDataProvider;
