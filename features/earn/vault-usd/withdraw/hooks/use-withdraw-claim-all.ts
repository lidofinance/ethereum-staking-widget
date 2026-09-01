import { useCallback, useMemo } from 'react';
import { WalletClient } from 'viem';
import invariant from 'tiny-invariant';
import { useLidoSDK, useMainnetOnlyWagmi } from 'modules/web3';
import { useWithdrawClaimAll } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim-all';
import { useTxModalStagesWithdrawClaim } from 'modules/mellow-meta-vaults/hooks/use-withdraw-claim-tx-modal';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { TOKENS, TOKEN_SYMBOLS } from 'consts/tokens';
import { getRedeemQueueWritableContract } from '../../contracts';
import type { UsdWithdrawToken } from '../../types';
import type { UsdVaultWithdrawRequest } from '../types';
import { groupUsdWithdrawRequestsByToken } from '../utils';
import { useUsdVaultWithdrawFormData } from './use-withdraw-form-data';
import { useUsdVaultWithdrawRequests } from './use-withdraw-requests';

const useUsdVaultWithdrawClaimAllForToken = (
  token: UsdWithdrawToken,
  claimableRequests: UsdVaultWithdrawRequest[],
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

  return useWithdrawClaimAll({
    redeemQueue,
    token: tokenSymbol,
    txModalStages,
    claimableRequests,
    onRetry,
    refetchTokenBalance: refetchData,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalClaimAll,
  });
};

export const useUsdVaultWithdrawClaimAll = (onRetry?: () => void) => {
  const { data } = useUsdVaultWithdrawRequests();

  const groups = useMemo(
    () => groupUsdWithdrawRequestsByToken(data.claimableRequests),
    [data.claimableRequests],
  );

  const usdc = useUsdVaultWithdrawClaimAllForToken(
    TOKENS.usdc,
    groups[TOKENS.usdc],
    onRetry,
  );
  const usdt = useUsdVaultWithdrawClaimAllForToken(
    TOKENS.usdt,
    groups[TOKENS.usdt],
    onRetry,
  );

  // `claim(receiver, timestamps[])` is per queue, so claiming across both payout
  // tokens is inherently one tx per queue. They run sequentially and bail on the
  // first failure — an earlier successful claim stays valid.
  const withdrawClaimAll = useCallback(async () => {
    if (groups[TOKENS.usdc].length > 0 && !(await usdc.withdrawClaimAll()))
      return false;
    if (groups[TOKENS.usdt].length > 0 && !(await usdt.withdrawClaimAll()))
      return false;
    return true;
  }, [groups, usdc, usdt]);

  return {
    withdrawClaimAll,
    isClaiming: usdc.isClaiming || usdt.isClaiming,
  };
};
