import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { usePreviewDeposit } from 'modules/mellow-meta-vaults';
import { getCollectorContract, getDepositQueueContract } from '../../contracts';
import { useMemo } from 'react';

export const useUsdVaultPreviewDeposit = ({ amount, token }: any) => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const collector = useMemo(
    () => getCollectorContract(publicClient),
    [publicClient],
  );
  const depositQueue = useMemo(
    () => getDepositQueueContract({ publicClient, token }),
    [publicClient, token],
  );

  return usePreviewDeposit({
    collector,
    depositQueue,
    amount,
    token,
  });
};
