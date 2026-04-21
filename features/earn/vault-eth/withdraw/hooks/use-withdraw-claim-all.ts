import { useMemo } from 'react';
import { WalletClient } from 'viem';
import invariant from 'tiny-invariant';
import { useLidoSDK, useMainnetOnlyWagmi } from 'modules/web3';
import { useWithdrawClaimAll } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim-all';
import { useTxModalStagesWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim-tx-modal';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { getRedeemQueueWritableContractWSTETH } from '../../contracts';
import { useEthVaultWithdrawFormData } from './use-withdraw-form-data';
import { useEthVaultWithdrawRequests } from './use-withdraw-requests';

export const useEthVaultWithdrawClaimAll = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const { refetchData } = useEthVaultWithdrawFormData();
  const { data } = useEthVaultWithdrawRequests();

  const { txModalStages } = useTxModalStagesWithdrawClaim({
    willReceiveToken: TOKEN_SYMBOLS.wsteth,
    token: TOKEN_SYMBOLS.wsteth,
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

  const claimableRequests = data?.claimableRequests ?? [];

  return useWithdrawClaimAll({
    redeemQueue,
    token: TOKEN_SYMBOLS.wsteth,
    txModalStages,
    claimableRequests,
    onRetry,
    refetchTokenBalance: refetchData,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalClaimAll,
  });
};
