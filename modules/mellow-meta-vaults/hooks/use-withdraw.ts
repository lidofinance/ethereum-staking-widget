import { useCallback } from 'react';
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
import { QA_KEYS } from 'consts/qa-keys';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { ErrorMessage, getError } from 'utils';
import { overrideWithQAMockBigInt } from 'utils/qa';
import {
  CollectorContract,
  AsyncRedeemQueueWritableContract,
  SyncRedeemQueueWritableContract,
} from '../types/contracts';
import { TxModalStages } from '../types/tx-modal-stages';
import { COLLECTOR_CONFIG } from '../consts';
import { meetsSyncRedeemRequirements } from '../utils/sync-redeem-requirements';

const QA_REMAINING_DAILY_LIMIT_KEY =
  QA_KEYS.mellowSyncRedeemRemainingDailyLimit;
const QA_LIQUID_ASSETS_KEY = QA_KEYS.mellowSyncRedeemLiquidAssets;

type SyncWithdrawAvailability =
  | { status: 'available' }
  | { status: 'unavailable' }
  | { status: 'unknown'; error: unknown };

export const useWithdraw = ({
  asyncRedeemQueue,
  syncRedeemQueue,
  collector,
  txModalStages,
  onRetry,
  matomoEventStart,
  matomoEventSuccess,
}: {
  asyncRedeemQueue: AsyncRedeemQueueWritableContract;
  syncRedeemQueue?: SyncRedeemQueueWritableContract; // Omit for async-only queues
  collector: CollectorContract;
  txModalStages: TxModalStages;
  onRetry?: () => void;
  matomoEventStart?: MATOMO_EVENT_TYPE;
  matomoEventSuccess?: MATOMO_EVENT_TYPE;
}) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const txFlow = useTxFlow();

  const withdraw = useCallback(
    async ({ amount }: { amount: bigint }): Promise<boolean> => {
      if (matomoEventStart) trackMatomoEvent(matomoEventStart);
      invariant(address, 'needs address');

      const checkSyncWithdrawAvailability = async (
        syncQueue: SyncRedeemQueueWritableContract,
      ) => {
        const [, actualRemainingDailyLimit] =
          await syncQueue.read.remainingDailyLimit();
        const remainingDailyLimit = overrideWithQAMockBigInt(
          actualRemainingDailyLimit,
          QA_REMAINING_DAILY_LIMIT_KEY,
        );

        // Eager return to save rpc calls, duplicates predicate from meetsSyncRedeemRequirements
        if (amount > remainingDailyLimit) return false;

        const [{ assets }, actualLiquidAssets] = await Promise.all([
          collector.read.getWithdrawalParams([
            amount,
            syncQueue.address,
            COLLECTOR_CONFIG,
          ]) as Promise<{ assets: bigint }>,
          syncQueue.read.getLiquidAssets(),
        ]);
        const liquidAssets = overrideWithQAMockBigInt(
          actualLiquidAssets,
          QA_LIQUID_ASSETS_KEY,
        );

        return meetsSyncRedeemRequirements({
          requestedShares: amount,
          requestedAssets: assets,
          remainingDailyLimit,
          liquidAssets,
        });
      };

      const getSyncWithdrawAvailability =
        async (): Promise<SyncWithdrawAvailability> => {
          // Async-only queue: there is no instant route to check.
          if (!syncRedeemQueue) return { status: 'unavailable' };

          try {
            return (await checkSyncWithdrawAvailability(syncRedeemQueue))
              ? { status: 'available' }
              : { status: 'unavailable' };
          } catch (error) {
            return { status: 'unknown', error };
          }
        };

      const syncWithdrawAvailability = await getSyncWithdrawAvailability();

      if (syncWithdrawAvailability.status === 'unknown') {
        console.error(
          'Failed to check instant withdrawal availability, falling back to the async redeem queue',
          syncWithdrawAvailability.error,
        );
      }

      // Narrowed once so the tx branches below don't need assertions.
      const syncQueue =
        syncWithdrawAvailability.status === 'available'
          ? syncRedeemQueue
          : undefined;
      const isSyncWithdrawRoute = !!syncQueue;

      const asyncWithdrawArgs = [amount] as const;
      const syncWithdrawArgs = [amount, address] as const;

      try {
        await txFlow({
          callsFn: async () => {
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
          const syncWithdrawAvailability = await getSyncWithdrawAvailability();

          if (syncWithdrawAvailability.status === 'unknown') {
            console.error(
              'Failed to recheck instant withdrawal availability after the transaction error',
              syncWithdrawAvailability.error,
            );
          }

          isInstantWithdrawalUnavailable =
            syncWithdrawAvailability.status === 'unavailable';
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
      asyncRedeemQueue.abi,
      asyncRedeemQueue.address,
      asyncRedeemQueue.estimateGas,
      asyncRedeemQueue.write,
      collector.read,
      core,
      matomoEventStart,
      matomoEventSuccess,
      onRetry,
      syncRedeemQueue,
      txFlow,
      txModalStages,
    ],
  );

  return {
    withdraw,
  };
};
