import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { usePreviewWithdraw } from 'modules/mellow-meta-vaults/hooks/use-preview-withdraw';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { TOKENS } from 'consts/tokens';
import {
  getCollectorContract,
  getRedeemQueueContractUSDC,
} from '../../contracts';

export const useUsdVaultPreviewWithdraw = ({
  shares: usdShares,
}: {
  shares: bigint | null | undefined;
}) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const collector = useMemo(
    () => getCollectorContract(publicClientMainnet),
    [publicClientMainnet],
  );
  const redeemQueue = useMemo(
    () => getRedeemQueueContractUSDC(publicClientMainnet),
    [publicClientMainnet],
  );

  return usePreviewWithdraw({
    collector,
    redeemQueue,
    redeemQueueToken: TOKENS.usdc,
    shares: usdShares,
  });
};
