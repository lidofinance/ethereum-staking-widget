import { WalletClient } from 'viem';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import { useLidoSDK } from 'modules/web3';
import { useWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim';
import { useTxModalStagesWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim-tx-modal';
import { getTokenSymbol } from 'utils/getTokenSymbol';
import { getRedeemQueueWritableContractWSTETH } from '../../contracts';

export const useEthVaultWithdrawClaim = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const token = getTokenSymbol('wsteth');

  const { txModalStages } = useTxModalStagesWithdrawClaim({
    willReceiveToken: getTokenSymbol('wsteth'),
    token,
    operationText: 'Claiming',
  });

  const redeemQueue = getRedeemQueueWritableContractWSTETH(
    publicClient,
    core.web3Provider as WalletClient,
  );

  return useWithdrawClaim({
    redeemQueue,
    token: getTokenSymbol('wsteth'),
    txModalStages,
    onRetry,
    refetchTokenBalance: async () => void 0, // TODO: implement refetchTokenBalance for ETH
  });
};
