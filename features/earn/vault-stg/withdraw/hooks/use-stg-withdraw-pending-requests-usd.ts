import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import { getWithdrawalParams } from '../utils';

type PendingRequest = {
  timestamp: bigint;
  shares: bigint;
};

export const useSTGWithdrawPendingRequestsUsd = (
  pendingRequests: PendingRequest[],
) => {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: [
      'stg',
      'withdraw',
      'pending-requests-usd',
      pendingRequests.map((r) => [r.timestamp.toString(), r.shares.toString()]),
    ] as const,
    enabled: !!publicClient && pendingRequests.length > 0,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');
      const results = await Promise.all(
        pendingRequests.map(async (request) => {
          const { sharesUSDC } = await getWithdrawalParams({
            shares: request.shares,
            publicClient,
          });
          return [request.timestamp.toString(), sharesUSDC] as const;
        }),
      );
      const map: Record<string, bigint> = {};
      for (const [key, value] of results) map[key] = value;
      return map;
    },
  });
};
