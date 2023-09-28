import { FC, PropsWithChildren, createContext, useContext } from 'react';

import { useWithdrawalRequests } from 'features/withdrawals/hooks';

import invariant from 'tiny-invariant';

const claimDataContext = createContext<ClaimDataValue | null>(null);
claimDataContext.displayName = 'ClaimDataContext';

export type ClaimDataValue = ReturnType<typeof useWithdrawalRequests>;

export const ClaimDataProvider: FC<PropsWithChildren> = ({ children }) => {
  const withdrawRequests = useWithdrawalRequests();

  return (
    <claimDataContext.Provider value={withdrawRequests}>
      {children}
    </claimDataContext.Provider>
  );
};

export const useClaimData = () => {
  const r = useContext(claimDataContext);
  invariant(r, 'useClaimData was used outside of ClaimDataProvider');
  return r;
};
