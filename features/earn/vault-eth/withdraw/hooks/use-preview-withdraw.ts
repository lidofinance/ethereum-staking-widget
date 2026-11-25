import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { usePreviewWithdraw } from 'modules/mellow-meta-vaults';
import { TOKENS } from 'consts/tokens';
import {
  getCollectorContract,
  getRedeemQueueContractWSTETH,
} from '../../contracts';

type UseEthVaultPreviewWithdrawArgs = {
  shares: bigint | null | undefined;
};

export const useEthVaultPreviewWithdraw = ({
  shares: earnethShares,
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

  return usePreviewWithdraw({
    collector,
    redeemQueue,
    redeemQueueToken: TOKENS.wsteth,
    shares: earnethShares,
  });
};
