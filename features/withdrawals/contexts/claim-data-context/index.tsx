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
  claimSelection: ReturnType<typeof useClaimSelection>;
  withdrawalRequestsData: ReturnType<typeof useWithdrawalRequests>['data'];
  loading: ReturnType<typeof useWithdrawalRequests>['initialLoading'];
  refetching: ReturnType<typeof useWithdrawalRequests>['loading'];
  update: ReturnType<typeof useWithdrawalRequests>['update'];
};

export const ClaimDataProvider: FC = ({ children }) => {
  const withdrawRequests = useWithdrawalRequests();
  const claimSelection = useClaimSelection(
    withdrawRequests.data?.sortedClaimableRequests ?? null,
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

  const value: ClaimDataValue = useMemo(() => {
    return {
      withdrawalRequestsData: withdrawRequests.data,
      get loading() {
        return withdrawRequests.initialLoading;
      },
      get refetching() {
        return withdrawRequests.loading;
      },
      update: withdrawRequests.update,
      claimSelection,
      requests,
      ethToClaim,
    };
  }, [claimSelection, withdrawRequests, ethToClaim, requests]);

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
