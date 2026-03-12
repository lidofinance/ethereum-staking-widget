import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { getRedeemQueueContractUSDC } from '../../contracts';
import { useWithdrawRequests } from 'modules/mellow-meta-vaults/hooks/use-withdraw-requests';
import { useMainnetOnlyWagmi } from 'modules/web3';

export const useUsdVaultWithdrawRequests = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const redeemQueue = useMemo(
    () => getRedeemQueueContractUSDC(publicClientMainnet),
    [publicClientMainnet],
  );

  return useWithdrawRequests({ redeemQueue });
};
