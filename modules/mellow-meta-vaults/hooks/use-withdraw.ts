import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { encodeFunctionData } from 'viem';
import invariant from 'tiny-invariant';

import {
  useTxFlow,
  useLidoSDK,
  useDappStatus,
  AACall,
  applyRoundUpTxParameter,
} from 'modules/web3';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { ErrorMessage, getError } from 'utils';
import {
  CollectorContract,
  AsyncRedeemQueueWritableContract,
  SyncRedeemQueueWritableContract,
} from '../types/contracts';
import { TxModalStages } from '../types/tx-modal-stages';
import {
  getWithdrawQuoteQueryOptions,
  isWithdrawQuoteWorse,
} from '../quotes/withdraw-quote';
import { verifyQuote } from '../quotes/verify-quote';

type UseWithdrawArgs = {
  asyncRedeemQueue: AsyncRedeemQueueWritableContract;
  syncRedeemQueue?: SyncRedeemQueueWritableContract; // Omit for async-only queues
  collector: CollectorContract;
  txModalStages: TxModalStages;
  onRetry?: () => void;
  matomoEventStart?: MATOMO_EVENT_TYPE;
  matomoEventSuccess?: MATOMO_EVENT_TYPE;
};

type WithdrawArgs = {
  amount: bigint;
};

export const useWithdraw = ({
  asyncRedeemQueue,
  syncRedeemQueue,
  collector,
  txModalStages,
  onRetry,
  matomoEventStart,
  matomoEventSuccess,
}: UseWithdrawArgs) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const txFlow = useTxFlow();
  const queryClient = useQueryClient();

  const withdraw = useCallback(
    async ({ amount }: WithdrawArgs): Promise<boolean> => {
      if (matomoEventStart) trackMatomoEvent(matomoEventStart);
      invariant(address, 'needs address');

      const quoteOptions = getWithdrawQuoteQueryOptions({
        collector,
        asyncRedeemQueue,
        syncRedeemQueue,
        shares: amount,
      });

      let isSyncWithdrawRoute = false;

      // Last async step before the redeem call is handed to the wallet. Picks
      // the route exactly like the form preview did and refuses to proceed if
      // the payout dropped below what the user saw (e.g. a sync penalty
      // configured since the preview). Returns the queue to redeem through,
      // narrowed once so the tx branches don't need assertions.
      const resolveRedeemQueue = async () => {
        const quote = await verifyQuote({
          queryClient,
          options: quoteOptions,
          isWorse: isWithdrawQuoteWorse,
        });
        const syncQueue = quote.route === 'sync' ? syncRedeemQueue : undefined;
        isSyncWithdrawRoute = !!syncQueue;
        return syncQueue;
      };

      const asyncWithdrawArgs = [amount] as const;
      const syncWithdrawArgs = [amount, address] as const;

      try {
        await txFlow({
          callsFn: async () => {
            const syncQueue = await resolveRedeemQueue();

            const call: AACall = syncQueue
              ? {
                  to: syncQueue.address,
                  data: encodeFunctionData({
                    abi: syncQueue.abi,
                    functionName: 'redeem',
                    args: syncWithdrawArgs,
                  }),
                }
              : {
                  to: asyncRedeemQueue.address,
                  data: encodeFunctionData({
                    abi: asyncRedeemQueue.abi,
                    functionName: 'redeem',
                    args: asyncWithdrawArgs,
                  }),
                };

            return [call];
          },
          sendTransaction: async (txStagesCallback) => {
            const syncQueue = await resolveRedeemQueue();

            if (syncQueue) {
              await core.performTransaction({
                getGasLimit: async (opts) =>
                  applyRoundUpTxParameter(
                    await syncQueue.estimateGas.redeem(syncWithdrawArgs, {
                      ...opts,
                    }),
                  ),
                sendTransaction: (opts) => {
                  return syncQueue.write.redeem(syncWithdrawArgs, {
                    ...opts,
                  });
                },
                callback: txStagesCallback,
              });
              return;
            }

            await core.performTransaction({
              getGasLimit: async (opts) =>
                applyRoundUpTxParameter(
                  await asyncRedeemQueue.estimateGas.redeem(asyncWithdrawArgs, {
                    ...opts,
                  }),
                ),
              sendTransaction: (opts) => {
                return asyncRedeemQueue.write.redeem(asyncWithdrawArgs, {
                  ...opts,
                });
              },
              callback: txStagesCallback,
            });
          },
          onSign: async () => {
            return txModalStages.sign(amount);
          },
          onReceipt: async ({ txHashOrCallId, isAA }) => {
            return txModalStages.pending(amount, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            txModalStages.success(amount, txHash, isSyncWithdrawRoute);
            if (matomoEventSuccess) trackMatomoEvent(matomoEventSuccess);
          },
          onMultisigDone: () => {
            txModalStages.successMultisig();
          },
        });

        return true;
      } catch (error) {
        console.error(error);

        const errorMessage = getError(error);
        const isUserActionError = [
          ErrorMessage.DENIED_SIG,
          ErrorMessage.ENABLE_BLIND_SIGNING,
          ErrorMessage.DEVICE_LOCKED,
        ].includes(errorMessage as ErrorMessage);

        let isInstantWithdrawalUnavailable = false;

        if (isSyncWithdrawRoute && !isUserActionError) {
          try {
            const recheck = await queryClient.fetchQuery({
              ...quoteOptions,
              staleTime: 0,
            });
            isInstantWithdrawalUnavailable = recheck.isInstantUnavailable;
          } catch (recheckError) {
            console.error(
              'Failed to recheck instant withdrawal availability after the transaction error',
              recheckError,
            );
          }
        }

        if (isInstantWithdrawalUnavailable) {
          txModalStages.instantWithdrawalUnavailable();
        } else {
          txModalStages.failed(error, onRetry);
        }

        return false;
      }
    },
    [
      address,
      asyncRedeemQueue,
      collector,
      core,
      matomoEventStart,
      matomoEventSuccess,
      onRetry,
      queryClient,
      syncRedeemQueue,
      txFlow,
      txModalStages,
    ],
  );

  return {
    withdraw,
  };
};
