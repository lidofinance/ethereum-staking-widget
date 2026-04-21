import { useMemo } from 'react';
import { WalletClient } from 'viem';
import invariant from 'tiny-invariant';
import { useLidoSDK, useMainnetOnlyWagmi } from 'modules/web3';
import { useWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim';
import { useTxModalStagesWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim-tx-modal';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { getRedeemQueueWritableContractUSDC } from '../../contracts';
import { useUsdVaultWithdrawFormData } from './use-withdraw-form-data';

export const useUsdVaultWithdrawClaim = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const { refetchData } = useUsdVaultWithdrawFormData();

  const { txModalStages } = useTxModalStagesWithdrawClaim({
    willReceiveToken: TOKEN_SYMBOLS.usdc,
    token: TOKEN_SYMBOLS.usdc,
    operationText: 'Claiming',
  });

  const redeemQueue = useMemo(
    () =>
      getRedeemQueueWritableContractUSDC(
        publicClientMainnet,
        core.web3Provider as WalletClient,
      ),
    [publicClientMainnet, core.web3Provider],
  );

  return useWithdrawClaim({
    redeemQueue,
    token: TOKEN_SYMBOLS.usdc,
    txModalStages,
    onRetry,
    refetchTokenBalance: refetchData,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalClaim,
  });
};
