import { WalletClient } from 'viem';
import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useLidoSDK, useMainnetOnlyWagmi } from 'modules/web3';
import { useWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim';
import { useTxModalStagesWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim-tx-modal';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { getRedeemQueueWritableContractWSTETH } from '../../contracts';
import { useEthVaultWithdrawFormData } from './use-withdraw-form-data';

export const useEthVaultWithdrawClaim = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

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
        publicClientMainnet,
        core.web3Provider as WalletClient,
      ),
    [publicClientMainnet, core.web3Provider],
  );

  return useWithdrawClaim({
    redeemQueue,
    token: getTokenSymbol('wsteth'),
    txModalStages,
    onRetry,
    refetchTokenBalance: refetchData,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalClaim,
  });
};
