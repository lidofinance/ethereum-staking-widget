import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useDepositQueueRequest } from 'modules/mellow-meta-vaults/hooks/use-deposit-queue-request';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { EthDepositToken } from '../../types';
import { getAsyncDepositQueueContract } from '../../contracts';

export const useEthVaultDepositQueueRequest = (token: EthDepositToken) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const depositQueue = useMemo(
    () =>
      getAsyncDepositQueueContract({
        publicClient: publicClientMainnet,
        token,
      }),
    [publicClientMainnet, token],
  );

  return useDepositQueueRequest({
    token,
    depositQueue,
  });
};
