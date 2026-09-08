import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { usePreviewWithdraw } from 'modules/mellow-meta-vaults/hooks/use-preview-withdraw';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { getCollectorContract, getRedeemQueueContract } from '../../contracts';
import type { UsdWithdrawToken } from '../../types';

export const useUsdVaultPreviewWithdraw = ({
  shares: usdShares,
  token,
}: {
  shares: bigint | null | undefined;
  token: UsdWithdrawToken;
}) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const collector = useMemo(
    () => getCollectorContract(publicClientMainnet),
    [publicClientMainnet],
  );
  const redeemQueue = useMemo(
    () => getRedeemQueueContract({ publicClient: publicClientMainnet, token }),
    [publicClientMainnet, token],
  );

  return usePreviewWithdraw({
    collector,
    redeemQueue,
    redeemQueueToken: token,
    shares: usdShares,
  });
};
