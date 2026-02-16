import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { usePreviewWithdraw } from 'modules/mellow-meta-vaults/hooks/use-preview-withdraw';
import {
  getCollectorContract,
  getRedeemQueueContractWSTETH,
} from '../../contracts';

export const useEthVaultPreviewWithdraw = ({
  shares: earnethShares,
}: {
  shares: bigint | null | undefined;
}) => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const collector = useMemo(
    () => getCollectorContract(publicClient),
    [publicClient],
  );
  const redeemQueue = useMemo(
    () => getRedeemQueueContractWSTETH(publicClient),
    [publicClient],
  );

  return usePreviewWithdraw({
    collector,
    redeemQueue,
    shares: earnethShares,
  });
};
