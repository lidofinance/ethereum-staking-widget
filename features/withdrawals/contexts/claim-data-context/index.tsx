import { FC, createContext, useMemo, useContext } from 'react';
import { BigNumber } from 'ethers';

import { useWithdrawalRequests } from 'features/withdrawals/hooks';
import { RequestStatusesUnion } from 'features/withdrawals/types/request-status';

import { useClaimSelection } from './useClaimSelection';
import invariant from 'tiny-invariant';

const claimDataContext = createContext<ClaimDataValue | null>(null);
claimDataContext.displayName = 'ClaimDataContext';

export type ClaimDataValue = {
  ethToClaim: BigNumber;
  requests: RequestStatusesUnion[];
  withdrawalRequestsData: ReturnType<typeof useWithdrawalRequests>;
  claimSelection: ReturnType<typeof useClaimSelection>;
};

export const ClaimDataProvider: FC = ({ children }) => {
  const withdrawRequests = useWithdrawalRequests();
  const claimSelection = useClaimSelection(
    withdrawRequests.data?.sortedClaimableRequests ?? [],
  );

  const ethToClaim = useMemo(() => {
    return claimSelection.sortedSelectedRequests.reduce(
      (eth, r) => eth.add(r.claimableEth),
      BigNumber.from(0),
    );
  }, [claimSelection.sortedSelectedRequests]);

  const requests = useMemo(() => {
    return [
      ...(withdrawRequests.data?.sortedClaimableRequests ?? []),
      ...(withdrawRequests.data?.pendingRequests ?? []),
    ];
  }, [withdrawRequests.data]);

  const loading = withdrawRequests.initialLoading;

  const value: ClaimDataValue = useMemo(() => {
    return {
      withdrawalRequestsData: withdrawRequests,
      claimSelection,
      requests,
      ethToClaim,
      loading,
    };
  }, [claimSelection, withdrawRequests, ethToClaim, requests, loading]);

  return (
    <claimDataContext.Provider value={value}>
      {children}
    </claimDataContext.Provider>
  );
};

export const useClaimData = () => {
  const r = useContext(claimDataContext);
  invariant(r, 'useClaimData was used outside of ClaimDataProvider');
  return r;
};
