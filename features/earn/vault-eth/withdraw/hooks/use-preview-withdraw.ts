import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import { usePreviewWithdraw } from 'modules/mellow-meta-vaults/hooks/use-preview-withdraw';
import { useLidoSDK } from 'modules/web3';
import { WalletClient } from 'viem';
import {
  getCollectorContract,
  getRedeemQueueWritableContractWSTETH,
} from '../../contracts';

export const useEthVaultPreviewWithdraw = ({
  shares: earnethShares,
}: {
  shares: bigint | null | undefined;
}) => {
  const { core } = useLidoSDK();
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const collector = getCollectorContract(publicClient);
  const redeemQueue = getRedeemQueueWritableContractWSTETH(
    publicClient,
    core.web3Provider as WalletClient,
  );

  return usePreviewWithdraw({
    collector,
    redeemQueue,
    shares: earnethShares,
  });
};
