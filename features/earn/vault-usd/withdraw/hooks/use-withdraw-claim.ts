import { useCallback, useMemo } from 'react';
import { WalletClient } from 'viem';
import invariant from 'tiny-invariant';
import { useLidoSDK, useMainnetOnlyWagmi } from 'modules/web3';
import { useWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim';
import { useTxModalStagesWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim-tx-modal';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { TOKENS, TOKEN_SYMBOLS } from 'consts/tokens';
import { getRedeemQueueWritableContract } from '../../contracts';
import type { UsdWithdrawToken } from '../../types';
import { useUsdVaultWithdrawFormData } from './use-withdraw-form-data';

const useUsdVaultWithdrawClaimForToken = (
  token: UsdWithdrawToken,
  onRetry?: () => void,
) => {
  const { core } = useLidoSDK();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const { refetchData } = useUsdVaultWithdrawFormData();

  const tokenSymbol = TOKEN_SYMBOLS[token];

  const { txModalStages } = useTxModalStagesWithdrawClaim({
    willReceiveToken: tokenSymbol,
    token: tokenSymbol,
    operationText: 'Claiming',
  });

  const redeemQueue = useMemo(
    () =>
      getRedeemQueueWritableContract({
        publicClient: publicClientMainnet,
        walletClient: core.walletClient as WalletClient,
        token,
      }),
    [publicClientMainnet, core.walletClient, token],
  );

  return useWithdrawClaim({
    redeemQueue,
    token: tokenSymbol,
    txModalStages,
    onRetry,
    refetchTokenBalance: refetchData,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalClaim,
  });
};

export const useUsdVaultWithdrawClaim = (onRetry?: () => void) => {
  const usdc = useUsdVaultWithdrawClaimForToken(TOKENS.usdc, onRetry);
  const usdt = useUsdVaultWithdrawClaimForToken(TOKENS.usdt, onRetry);

  const withdrawClaim = useCallback(
    ({
      amount,
      timestamp,
      token,
    }: {
      amount: bigint;
      timestamp: number;
      token: UsdWithdrawToken;
    }) =>
      (token === TOKENS.usdt ? usdt : usdc).withdrawClaim({
        amount,
        timestamp,
      }),
    [usdc, usdt],
  );

  return {
    withdrawClaim,
    isClaiming: usdc.isClaiming || usdt.isClaiming,
  };
};
