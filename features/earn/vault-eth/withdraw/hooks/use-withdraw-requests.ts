import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { getRedeemQueueContractWSTETH } from '../../contracts';
import { useWithdrawRequests } from 'modules/mellow-meta-vaults/hooks/use-withdraw-requests';

export const useEthVaultWithdrawRequests = () => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const redeemQueue = useMemo(
    () => getRedeemQueueContractWSTETH(publicClient),
    [publicClient],
  );

  return useWithdrawRequests({ redeemQueue });
};
