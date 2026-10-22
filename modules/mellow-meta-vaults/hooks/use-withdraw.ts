import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import invariant from 'tiny-invariant';

import {
  useTxFlow,
  useLidoSDK,
  useDappStatus,
  applyRoundUpTxParameter,
  isStepSettled,
  TxSentDataUnavailableError,
  type TxFlowOptions,
} from 'modules/web3';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
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
  'mock-qa-helpers-mellow-sync-redeem-remaining-daily-limit';
const QA_LIQUID_ASSETS_KEY = 'mock-qa-helpers-mellow-sync-redeem-liquid-assets';

// the one step of a withdrawal; which queue it goes to is decided in prepare
const STEP = { redeem: 'redeem' } as const;

type SyncWithdrawAvailability =
  | { status: 'available' }
  | { status: 'unavailable' }
  | { status: 'unknown'; error: unknown };

// what every stage needs: the route, settled once before the first step
type WithdrawData = {
  // set when the instant (sync) queue takes the redemption
  syncQueue?: SyncRedeemQueueWritableContract;
};

// Errors that end at the wallet, before anything reached the chain: no point
// re-reading the sync queue for them
const USER_ACTION_ERRORS: readonly string[] = [
  ErrorMessage.DENIED_SIG,
  ErrorMessage.ENABLE_BLIND_SIGNING,
  ErrorMessage.DEVICE_LOCKED,
];

type UseWithdrawArgs = {
  asyncRedeemQueue: AsyncRedeemQueueWritableContract;
  syncRedeemQueue?: SyncRedeemQueueWritableContract; // Omit for async-only queues
  collector: CollectorContract;
  txModalStages: TxModalStages;
  onRetry?: () => void;
  matomoEventStart?: MATOMO_EVENT_TYPE;
  matomoEventSuccess?: MATOMO_EVENT_TYPE;
  // the vault's query scopes, refetched after a withdrawal whose outcome
  // could not be read; the whole cache without it
  refetchScope?: TxFlowOptions['refetchScope'];
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
  refetchScope,
}: UseWithdrawArgs) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const txFlow = useTxFlow();

  const withdraw = useCallback(
    async ({ amount }: WithdrawArgs): Promise<boolean> => {
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

        // The oracle report the queue prices with is not checked here: the
        // call site withholds `syncRedeemQueue` while it is unusable, see
        // features/earn/vault-eth/hooks/use-sync-redeem-report
        const [{ assets, isWithdrawalPossible }, actualLiquidAssets] =
          await Promise.all([
            collector.read.getWithdrawalParams([
              amount,
              syncQueue.address,
              COLLECTOR_CONFIG,
            ]) as Promise<{ assets: bigint; isWithdrawalPossible: boolean }>,
            syncQueue.read.getLiquidAssets(),
          ]);
        const liquidAssets = overrideWithQAMockBigInt(
          actualLiquidAssets,
          QA_LIQUID_ASSETS_KEY,
        );

        return meetsSyncRedeemRequirements({
          isWithdrawalPossible,
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

      const asyncWithdrawArgs = [amount] as const;
      const syncWithdrawArgs = [amount, address] as const;

      const { isSuccess } = await txFlow<WithdrawData>({
        refetchScope,
        prepare: async () => {
          const availability = await getSyncWithdrawAvailability();
          if (availability.status === 'unknown') {
            console.error(
              'Failed to check instant withdrawal availability, falling back to the async redeem queue',
              availability.error,
            );
          }
          return {
            syncQueue:
              availability.status === 'available' ? syncRedeemQueue : undefined,
          };
        },
        callsFn: async ({ data: { syncQueue } }) => [
          syncQueue
            ? {
                stepId: STEP.redeem,
                to: syncQueue.address,
                data: encodeFunctionData({
                  abi: syncQueue.abi,
                  functionName: 'redeem',
                  args: syncWithdrawArgs,
                }),
              }
            : {
                stepId: STEP.redeem,
                to: asyncRedeemQueue.address,
                data: encodeFunctionData({
                  abi: asyncRedeemQueue.abi,
                  functionName: 'redeem',
                  args: asyncWithdrawArgs,
                }),
              },
        ],
        sendStep: async (_step, txStagesCallback, { data: { syncQueue } }) => {
          if (syncQueue) {
            await core.performTransaction({
              getGasLimit: async (opts) =>
                applyRoundUpTxParameter(
                  await syncQueue.estimateGas.redeem(syncWithdrawArgs, opts),
                ),
              sendTransaction: (opts) =>
                syncQueue.write.redeem(syncWithdrawArgs, opts),
              callback: txStagesCallback,
            });
            return;
          }
          await core.performTransaction({
            getGasLimit: async (opts) =>
              applyRoundUpTxParameter(
                await asyncRedeemQueue.estimateGas.redeem(
                  asyncWithdrawArgs,
                  opts,
                ),
              ),
            sendTransaction: (opts) =>
              asyncRedeemQueue.write.redeem(asyncWithdrawArgs, opts),
            callback: txStagesCallback,
          });
        },
        onSign: () => {
          txModalStages.sign(amount);
        },
        onReceipt: ({ txHashOrCallId, isAA }) => {
          txModalStages.pending(amount, txHashOrCallId, isAA);
        },
        onSuccess: ({ txHash, ctx: { data } }) => {
          txModalStages.success(amount, txHash, !!data.syncQueue);
          if (matomoEventSuccess) trackMatomoEvent(matomoEventSuccess);
        },
        onMultisigDone: () => {
          txModalStages.successMultisig();
        },
        onFailure: async ({ error, ctx }) => {
          console.error(error);

          // The redemption is on chain, only a follow-up read failed: the
          // flow resolves as a success and the modal says so. Re-reading the
          // sync queue here would see the capacity this very redemption used
          // and misreport it as "instant withdrawal unavailable". Same for a
          // redemption that was sent but could not be read back: it may have
          // landed, and the modal already says to reload
          if (
            isStepSettled(ctx, STEP.redeem) ||
            error instanceof TxSentDataUnavailableError
          ) {
            txModalStages.failed(error);
            return;
          }

          const isUserActionError = USER_ACTION_ERRORS.includes(
            getError(error),
          );
          // An instant redemption that did not land may have lost its buffer
          // to others in the meantime: tell the user to take the standard
          // route rather than retry into the same failure
          if (ctx.data?.syncQueue && !isUserActionError) {
            const availability = await getSyncWithdrawAvailability();
            if (availability.status === 'unknown') {
              console.error(
                'Failed to recheck instant withdrawal availability after the transaction error',
                availability.error,
              );
            }
            if (availability.status === 'unavailable') {
              txModalStages.instantWithdrawalUnavailable();
              return;
            }
          }

          txModalStages.failed(error, onRetry);
        },
      });

      // redeemed (or proposed to a multisig): the form resets and refetches
      return isSuccess;
    },
    [
      address,
      asyncRedeemQueue,
      collector.read,
      core,
      refetchScope,
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
