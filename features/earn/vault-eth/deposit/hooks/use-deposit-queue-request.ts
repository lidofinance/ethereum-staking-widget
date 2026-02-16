import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { usePublicClient } from 'wagmi';
import { useDepositQueueRequest } from 'modules/mellow-meta-vaults/hooks/use-deposit-queue-request';
import { EthDepositTokens } from '../../types';
import { getDepositQueueContract } from '../../contracts';

export const useEthVaultDepositQueueRequest = (token: EthDepositTokens) => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const depositQueue = useMemo(
    () =>
      getDepositQueueContract({
        publicClient,
        token,
      }),
    [publicClient, token],
  );

  return useDepositQueueRequest({
    token,
    depositQueue,
  });
};
