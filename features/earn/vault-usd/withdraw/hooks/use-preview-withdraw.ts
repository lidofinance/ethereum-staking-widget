import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { usePreviewWithdraw } from 'modules/mellow-meta-vaults/hooks/use-preview-withdraw';
import {
  getCollectorContract,
  getRedeemQueueContractUSDC,
} from '../../contracts';

export const useUsdVaultPreviewWithdraw = ({
  shares: usdShares,
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
    () => getRedeemQueueContractUSDC(publicClient),
    [publicClient],
  );

  return usePreviewWithdraw({
    collector,
    redeemQueue,
    shares: usdShares,
  });
};
