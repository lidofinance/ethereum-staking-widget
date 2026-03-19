import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';

import { useDappStatus } from 'modules/web3';
import { AsyncDepositQueueContract } from '../types/contracts';
import { MELLOW_VAULTS_QUERY_SCOPE } from '../consts';

type DepositRequest = [bigint, bigint]; // (timestamp, assets)

// Retrieves deposit queue information for a specific token:
// - The latest deposit request for the connected address, including:
//   - Creation timestamp
//   - Amount of assets deposited
//   The deposit request remains in the queue until claimed.
//   Note: The queue contract does not indicate whether the request has been pushed to the vault.
// - Claimable amount of shares (available after the deposit is pushed to the vault).

export const useDepositQueueRequest = <DepositToken extends string>({
  token,
  depositQueue,
}: {
  token: DepositToken;
  depositQueue: AsyncDepositQueueContract; // for old requests
}) => {
  const { address, isDappActive } = useDappStatus();

  const isEnabled = isDappActive && !!address;

  const query = useQuery({
    queryKey: [
      MELLOW_VAULTS_QUERY_SCOPE,
      'deposit-request',
      depositQueue.address,
      token,
      { address },
    ] as const,
    queryFn: async () => {
      invariant(address, 'No address provided');

      const [depositRequest, claimableShares] = await Promise.all([
        (await depositQueue.read.requestOf([address])) as DepositRequest,
        await depositQueue.read.claimableOf([address]),
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
