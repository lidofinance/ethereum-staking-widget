import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { usePreviewWithdraw } from 'modules/mellow-meta-vaults/hooks/use-preview-withdraw';
import { useMainnetOnlyWagmi } from 'modules/web3';
import {
  getCollectorContract,
  getRedeemQueueContract,
  getSyncRedeemQueueContract,
} from '../../contracts';
import type { UsdWithdrawToken } from '../../types';

type UseUsdVaultPreviewWithdrawArgs = {
  shares: bigint | null | undefined;
  token: UsdWithdrawToken;
  // True for the withdrawal form: quote the route the tx will take (instant when
  // limits allow). Leave false to value shares already queued for async redemption.
  includeInstantRoute?: boolean;
};

export const useUsdVaultPreviewWithdraw = ({
  shares: usdShares,
  token,
  includeInstantRoute = false,
}: UseUsdVaultPreviewWithdrawArgs) => {
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
  // undefined when the token has no sync queue: async-only, no instant route
  const syncRedeemQueue = useMemo(
    () =>
      includeInstantRoute
        ? getSyncRedeemQueueContract({
            publicClient: publicClientMainnet,
            token,
          })
        : undefined,
    [publicClientMainnet, token, includeInstantRoute],
  );

  return usePreviewWithdraw({
    collector,
    redeemQueue,
    syncRedeemQueue,
    redeemQueueToken: token,
    shares: usdShares,
  });
};
