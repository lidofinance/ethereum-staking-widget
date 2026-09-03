import { useCallback, useMemo, useState } from 'react';
import invariant from 'tiny-invariant';
import { WalletClient } from 'viem';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import {
  applyRoundUpTxParameter,
  useDappStatus,
  useLidoSDK,
  useMainnetOnlyWagmi,
  useTxFlow,
} from 'modules/web3';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { TOKENS } from 'consts/tokens';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { getRedeemQueueWritableContract } from '../../contracts';
import {
  getUsdVaultWithdrawClaimAmounts,
  getUsdVaultWithdrawClaimCalls,
} from '../claim-all-utils';
import { groupUsdWithdrawRequestsByToken } from '../utils';
import { useUsdVaultWithdrawClaimAllTxModal } from './use-withdraw-claim-all-tx-modal';
import { useUsdVaultWithdrawFormData } from './use-withdraw-form-data';
import { useUsdVaultWithdrawRequests } from './use-withdraw-requests';

export const useUsdVaultWithdrawClaimAll = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const { address } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const txFlow = useTxFlow();
  const { refetchData } = useUsdVaultWithdrawFormData();
  const { data } = useUsdVaultWithdrawRequests();
  const [isClaiming, setIsClaiming] = useState(false);

  const claimAmounts = useMemo(
    () => getUsdVaultWithdrawClaimAmounts(data.claimableRequests),
    [data.claimableRequests],
  );
  const { txModalStages } = useUsdVaultWithdrawClaimAllTxModal(claimAmounts);

  const groups = useMemo(
    () => groupUsdWithdrawRequestsByToken(data.claimableRequests),
    [data.claimableRequests],
  );

  const redeemQueues = useMemo(
    () => ({
      [TOKENS.usdc]: getRedeemQueueWritableContract({
        publicClient: publicClientMainnet,
        walletClient: core.walletClient as WalletClient,
        token: TOKENS.usdc,
      }),
      [TOKENS.usdt]: getRedeemQueueWritableContract({
        publicClient: publicClientMainnet,
        walletClient: core.walletClient as WalletClient,
        token: TOKENS.usdt,
      }),
    }),
    [core.walletClient, publicClientMainnet],
  );

  const claimOperations = useMemo(
    () =>
      [TOKENS.usdc, TOKENS.usdt]
        .map((token) => ({
          redeemQueue: redeemQueues[token],
          timestamps: groups[token].map(({ timestamp }) => Number(timestamp)),
        }))
        .filter(({ timestamps }) => timestamps.length > 0),
    [groups, redeemQueues],
  );

  const withdrawClaimAll = useCallback(async () => {
    invariant(address, 'No address provided');
    invariant(claimOperations.length > 0, 'No requests to claim');

    try {
      setIsClaiming(true);

      await txFlow({
        callsFn: async () =>
          getUsdVaultWithdrawClaimCalls(address, claimOperations),
        sendTransaction: async (txStagesCallback) => {
          for (const [
            index,
            { redeemQueue, timestamps },
          ] of claimOperations.entries()) {
            const claimArgs = [address, timestamps] as const;
            const isLast = index === claimOperations.length - 1;

            await core.performTransaction({
              getGasLimit: async (opts) =>
                applyRoundUpTxParameter(
                  await redeemQueue.estimateGas.claim(claimArgs, {
                    ...opts,
                  }),
                ),
              sendTransaction: (opts) =>
                redeemQueue.write.claim(claimArgs, { ...opts }),
              callback: async (stage) => {
                if (!isLast && stage.stage === TransactionCallbackStage.DONE) {
                  return;
                }
                await txStagesCallback(stage);
              },
            });
          }
        },
        onSign: () => txModalStages.sign(),
        onReceipt: ({ txHashOrCallId, isAA }) =>
          txModalStages.pending(txHashOrCallId, isAA),
        onSuccess: async ({ txHash }) => {
          txModalStages.success(txHash);
          await refetchData();
          trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalClaimAll);
        },
      });

      return true;
    } catch (error) {
      console.error(error);
      txModalStages.failed(error, onRetry);
      return false;
    } finally {
      setIsClaiming(false);
    }
  }, [
    address,
    claimOperations,
    core,
    onRetry,
    refetchData,
    txFlow,
    txModalStages,
  ]);

  return { withdrawClaimAll, isClaiming };
};
