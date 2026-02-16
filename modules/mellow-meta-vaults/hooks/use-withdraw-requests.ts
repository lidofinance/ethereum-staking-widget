import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import { useDappStatus } from 'modules/web3';
import { MELLOW_VAULTS_QUERY_SCOPE } from '../consts';
import { RedeemQueueContract } from '../types/contracts';
import { WithdrawRequestData } from '../types/withdraw-request-data';

export const useWithdrawRequests = ({
  redeemQueue,
}: {
  redeemQueue: RedeemQueueContract;
}) => {
  const { address, isDappActive } = useDappStatus();
  const publicClient = usePublicClient();

  const isEnabled = isDappActive && !!address;

  return useQuery({
    queryKey: [
      MELLOW_VAULTS_QUERY_SCOPE,
      redeemQueue.address,
      'withdraw-requests-of',
      { address },
    ] as const,
    queryFn: async () => {
      invariant(address, 'No address provided');
      invariant(publicClient, 'Public client is not available');

      // Fetch the first 100 requests (see limit). Pagination is not implemented.
      const requests = (await redeemQueue.read.requestsOf([
        address, // account
        0n, // offset
        100n, // limit
      ])) as WithdrawRequestData[];

      return requests;
    },
    select: (data) => {
      const claimableRequests =
        data.filter((item) => item.isClaimable === true) || [];
      const pendingRequests =
        data.filter((item) => item.isClaimable === false) || [];
      return { requests: data, claimableRequests, pendingRequests };
    },
    enabled: isEnabled,
  });
};
