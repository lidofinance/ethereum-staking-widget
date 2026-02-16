import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { useDepositQueueRequest } from 'modules/mellow-meta-vaults/hooks/use-deposit-queue-request';
import { EthDepositTokens } from '../../types';
import { getDepositQueueContract } from '../../contracts';

export const useEthVaultDepositQueueRequest = (token: EthDepositTokens) => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  return useDepositQueueRequest({
    token,
    depositQueue: getDepositQueueContract({
      publicClient,
      token,
    }),
  });
};
