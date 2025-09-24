import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import { useDappStatus } from 'modules/web3';
import { getSTGRedeemQueueContractWSTETH } from '../../contracts';

type RequestData = {
  // Timestamp when the redemption request was submitted.
  timestamp: bigint;
  // Amount of vault shares submitted for redemption.
  shares: bigint;
  // Whether the request has been processed and is now claimable.
  isClaimable: boolean;
  // Amount of assets that can be claimed by the user.
  assets: bigint;
};

export const useSTGWithdrawRequests = () => {
  const { address, isDappActive } = useDappStatus();
  const publicClient = usePublicClient();

  const isEnabled = isDappActive && !!address;

  return useQuery({
    queryKey: ['stg', 'withdraw-requests-of', { address }] as const,
    queryFn: async () => {
      invariant(address, 'No address provided');
      invariant(publicClient, 'Public client is not available');

      const redeemQueueContract = getSTGRedeemQueueContractWSTETH(publicClient);

      const requests = (await redeemQueueContract.read.requestsOf([
        address, // account
        0n, // offset
        100n, // limit
      ])) as RequestData[];

      return requests;
    },
    enabled: isEnabled,
  });
};
