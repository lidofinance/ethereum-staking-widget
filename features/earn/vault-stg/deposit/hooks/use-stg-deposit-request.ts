import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';

import { useDappStatus } from 'modules/web3';
import { getSTGDepositQueueContract } from '../../contracts';

type DepositRequest = [bigint, bigint]; // (timestamp, assets)

export const useSTGDepositRequest = (token: string) => {
  const { address, isDappActive } = useDappStatus();
  const publicClient = usePublicClient();

  const isEnabled = isDappActive && !!address;

  const query = useQuery({
    queryKey: ['stg', 'deposit-request', token, { address }] as const,
    queryFn: async () => {
      invariant(address, 'No address provided');
      invariant(publicClient, 'Public client is not available');

      const contract = getSTGDepositQueueContract({ publicClient, token });
      const [depositRequest, claimableShares] = await Promise.all([
        (await contract.read.requestOf([address])) as DepositRequest,
        await contract.read.claimableOf([address]),
      ]);
      return { depositRequest, claimableShares };
    },
    enabled: isEnabled,
  });

  const depositRequest =
    query.data && query.data?.depositRequest[0] !== 0n
      ? {
          timestamp: query.data.depositRequest[0],
          assets: query.data.depositRequest[1],
        }
      : undefined;

  const claimableShares = query.data?.claimableShares ?? 0n;

  return {
    isLoading: query.isLoading,
    depositRequest,
    claimableShares,
  };
};
