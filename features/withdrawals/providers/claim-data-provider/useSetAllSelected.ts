import { useEffect, useMemo } from 'react';

import { useWithdrawalRequests } from 'features/withdrawals/hooks';

type UseSetAllSelectedProps = {
  withdrawRequests: ReturnType<typeof useWithdrawalRequests>;
  setSelectedMany: (keys: string[]) => void;
};

export const useSetAllSelected = (props: UseSetAllSelectedProps) => {
  const { withdrawRequests, setSelectedMany } = props;

  const claimableRequestsIds = useMemo(
    () =>
      withdrawRequests.data?.sortedClaimableRequests.map(
        ({ stringId }) => stringId,
      ),
    [withdrawRequests.data?.sortedClaimableRequests],
  );

  const isNeedSetSelected = useMemo(
    () => !withdrawRequests.initialLoading && withdrawRequests.data,
    [withdrawRequests.data, withdrawRequests.initialLoading],
  );

  useEffect(() => {
    if (isNeedSetSelected && claimableRequestsIds) {
      setSelectedMany(claimableRequestsIds);
    }
  }, [claimableRequestsIds, isNeedSetSelected, setSelectedMany]);
};
