import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { useWithdrawRequests } from 'modules/mellow-meta-vaults/hooks/use-withdraw-requests';
import { getRedeemQueueContractWSTETH } from '../../contracts';

export const useEthVaultWithdrawRequests = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const redeemQueue = useMemo(
    () => getRedeemQueueContractWSTETH(publicClientMainnet),
    [publicClientMainnet],
  );

  return useWithdrawRequests({ redeemQueue });
};
