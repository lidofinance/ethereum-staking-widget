import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import { useLidoSDK } from 'modules/web3';
import { getRedeemQueueWritableContractWSTETH } from '../../contracts';
import { useWithdrawRequests } from 'modules/mellow-meta-vaults/hooks/use-withdraw-requests';
import { WalletClient } from 'viem';

export const useEthVaultWithdrawRequests = () => {
  const { core } = useLidoSDK();
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const redeemQueue = getRedeemQueueWritableContractWSTETH(
    publicClient,
    core.web3Provider as WalletClient,
  );

  return useWithdrawRequests({ redeemQueue });
};
