import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { usePreviewWithdraw } from 'modules/mellow-meta-vaults/hooks/use-preview-withdraw';
import { TOKENS } from 'consts/tokens';
import {
  getCollectorContract,
  getRedeemQueueContractWSTETH,
  getSyncRedeemQueueContractWSTETH,
} from '../../contracts';

type UseEthVaultPreviewWithdrawArgs = {
  shares: bigint | null | undefined;
  // True for the withdrawal form: quote the route the tx will take (instant when
  // limits allow). Leave false to value shares already queued for async redemption.
  includeInstantRoute?: boolean;
};

export const useEthVaultPreviewWithdraw = ({
  shares: earnethShares,
  includeInstantRoute = false,
}: UseEthVaultPreviewWithdrawArgs) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const collector = useMemo(
    () => getCollectorContract(publicClientMainnet),
    [publicClientMainnet],
  );
  const redeemQueue = useMemo(
    () => getRedeemQueueContractWSTETH(publicClientMainnet),
    [publicClientMainnet],
  );
  const syncRedeemQueue = useMemo(
    () =>
      includeInstantRoute
        ? getSyncRedeemQueueContractWSTETH(publicClientMainnet)
        : undefined,
    [publicClientMainnet, includeInstantRoute],
  );

  return usePreviewWithdraw({
    collector,
    redeemQueue,
    syncRedeemQueue,
    redeemQueueToken: TOKENS.wsteth,
    shares: earnethShares,
  });
};
