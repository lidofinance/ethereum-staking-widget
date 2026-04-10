import { useMemo } from 'react';
import { WalletClient } from 'viem';
import invariant from 'tiny-invariant';
import { useLidoSDK, useMainnetOnlyWagmi } from 'modules/web3';
import { useWithdrawClaimAll } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim-all';
import { useTxModalStagesWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim-tx-modal';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { getRedeemQueueWritableContractUSDC } from '../../contracts';
import { useUsdVaultWithdrawFormData } from './use-withdraw-form-data';
import { useUsdVaultWithdrawRequests } from './use-withdraw-requests';

export const useUsdVaultWithdrawClaimAll = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const { refetchData } = useUsdVaultWithdrawFormData();
  const { data } = useUsdVaultWithdrawRequests();

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

  const claimableRequests = data?.claimableRequests ?? [];

  return useWithdrawClaimAll({
    redeemQueue,
    token: TOKEN_SYMBOLS.usdc,
    txModalStages,
    claimableRequests,
    onRetry,
    refetchTokenBalance: refetchData,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalClaimAll,
  });
};
