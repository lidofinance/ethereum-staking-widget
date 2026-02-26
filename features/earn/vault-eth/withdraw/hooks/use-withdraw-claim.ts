import { WalletClient } from 'viem';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useLidoSDK } from 'modules/web3';
import { useWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim';
import { useTxModalStagesWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim-tx-modal';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { getRedeemQueueWritableContractWSTETH } from '../../contracts';
import { useEthVaultWithdrawFormData } from './use-withdraw-form-data';

export const useEthVaultWithdrawClaim = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const { refetchData } = useEthVaultWithdrawFormData();

  const token = getTokenSymbol('wsteth');

  const { txModalStages } = useTxModalStagesWithdrawClaim({
    willReceiveToken: getTokenSymbol('wsteth'),
    token,
    operationText: 'Claiming',
  });

  const redeemQueue = useMemo(
    () =>
      getRedeemQueueWritableContractWSTETH(
        publicClient,
        core.web3Provider as WalletClient,
      ),
    [publicClient, core.web3Provider],
  );

  return useWithdrawClaim({
    redeemQueue,
    token: getTokenSymbol('wsteth'),
    txModalStages,
    onRetry,
    refetchTokenBalance: refetchData,
  });
};
