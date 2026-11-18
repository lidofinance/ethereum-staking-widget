import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import invariant from 'tiny-invariant';

import {
  useTxFlow,
  useLidoSDK,
  useDappStatus,
  useMainnetOnlyWagmi,
  applyRoundUpTxParameter,
  isStepSettled,
  QuoteMismatchError,
  TxSentDataUnavailableError,
  type TxFlowOptions,
} from 'modules/web3';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { ErrorMessage, getError } from 'utils';
import { overrideWithQAMockBigInt } from 'utils/qa';
import {
  CollectorContract,
  OracleContract,
  AsyncRedeemQueueWritableContract,
  SyncRedeemQueueWritableContract,
} from '../types/contracts';
import { TxModalStages } from '../types/tx-modal-stages';
import { COLLECTOR_CONFIG } from '../consts';
import {
  isSyncRedeemReportUsable,
  meetsSyncRedeemRequirements,
} from '../utils/sync-redeem-requirements';
import {
  isQuoteWorse,
  readWithdrawQuote,
  type VaultQuote,
} from '../utils/quote';
import type { TxRetryHandler } from 'shared/transaction-modal';

const QA_REMAINING_DAILY_LIMIT_KEY =
  'mock-qa-helpers-mellow-sync-redeem-remaining-daily-limit';
const QA_LIQUID_ASSETS_KEY = 'mock-qa-helpers-mellow-sync-redeem-liquid-assets';
// Set to "0" to simulate a stale oracle report.
const QA_REPORT_TIMESTAMP_KEY =
  'mock-qa-helpers-mellow-sync-redeem-report-timestamp';

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
  // the vault's oracle; the sync queue prices a redemption with its report
  oracle: OracleContract;
  collector: CollectorContract;
  // The quote the form displays and its refetch: the withdrawal is held to
  // it. Required, so a caller states it: undefined only where no quote is
  // displayed
  shownQuote: VaultQuote | undefined;
  refetchQuote: (() => unknown) | undefined;
  txModalStages: TxModalStages;
  onRetry?: TxRetryHandler;
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
  oracle,
  collector,
  shownQuote,
  refetchQuote,
  txModalStages,
  onRetry,
  matomoEventStart,
  matomoEventSuccess,
  refetchScope,
}: UseWithdrawArgs) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  const txFlow = useTxFlow();

  const withdraw = useCallback(
    async ({ amount }: WithdrawArgs): Promise<boolean> => {
      if (matomoEventStart) trackMatomoEvent(matomoEventStart);
      invariant(address, 'needs address');

      // The sync queue's own terms, which the Collector does not check. It
      // reverts on a stale, suspicious or zero report (StaleReport,
      // InvalidReport). It pays out with its `penaltyD6` while the async
      // queue charges none: a non-zero sync penalty makes the async queue
      // cheaper, so route there
      const checkSyncTerms = async (
        syncQueue: SyncRedeemQueueWritableContract,
      ) => {
        invariant(publicClientMainnet, 'Public client is not available');

        const [asset, [penaltyD6, maxAge], block] = await Promise.all([
          syncQueue.read.asset(),
          syncQueue.read.syncRedeemParams(),
          publicClientMainnet.getBlock(),
        ]);
        if (penaltyD6 > 0n) return false;
        const report = await oracle.read.getReport([asset]);

        return isSyncRedeemReportUsable({
          report: {
            ...report,
            timestamp: Number(
              overrideWithQAMockBigInt(
                BigInt(report.timestamp),
                QA_REPORT_TIMESTAMP_KEY,
              ),
            ),
          },
          maxAge,
          // The contract compares with the block time, not the user's clock
          nowSeconds: Number(block.timestamp),
        });
      };

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

        const [
          { assets, isWithdrawalPossible },
          actualLiquidAssets,
          areSyncTermsMet,
        ] = await Promise.all([
          collector.read.getWithdrawalParams([
            amount,
            syncQueue.address,
            COLLECTOR_CONFIG,
          ]) as Promise<{ assets: bigint; isWithdrawalPossible: boolean }>,
          syncQueue.read.getLiquidAssets(),
          checkSyncTerms(syncQueue),
        ]);
        const liquidAssets = overrideWithQAMockBigInt(
          actualLiquidAssets,
          QA_LIQUID_ASSETS_KEY,
        );

        if (!areSyncTermsMet) return false;

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

      // The quote is re-read right before sending, as the last step before
      // the wallet is reached in both signing paths, on the queue the
      // withdrawal goes to. Only a worse quote than the displayed one stops
      // the withdrawal; a better one passes. The form displays the async
      // queue's quote: the Collector prices a redemption by the queue's asset
      // alone (oracle price, less the redeem fee), so the sync queue of the
      // same asset quotes the same, and its own penalty routes to the async
      // queue in prepare
      const verifyQuote = async ({ syncQueue }: WithdrawData) => {
        // A penalty set on the sync queue since prepare: the instant route
        // would charge it, so stop here; the next attempt goes async
        const syncPenaltyCheck = syncQueue
          ? syncQueue.read.syncRedeemParams().then(([penaltyD6]) => {
              if (penaltyD6 > 0n) {
                void refetchQuote?.();
                throw new QuoteMismatchError();
              }
            })
          : undefined;
        if (!shownQuote) {
          await syncPenaltyCheck;
          return;
        }
        const [quote] = await Promise.all([
          readWithdrawQuote({
            collector,
            redeemQueue: syncQueue ?? asyncRedeemQueue,
            shares: amount,
          }),
          syncPenaltyCheck,
        ]);
        if (isQuoteWorse(quote, shownQuote)) {
          void refetchQuote?.();
          throw new QuoteMismatchError();
        }
      };

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
        // a batch is signed as built, so it is checked once built; a
        // stepwise send checks right before the redemption
        callsFn: async ({ isAA, data }) => {
          const { syncQueue } = data;
          const calls = [
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
          ];
          if (isAA) await verifyQuote(data);
          return calls;
        },
        sendStep: async (_step, txStagesCallback, { data }) => {
          await verifyQuote(data);
          const { syncQueue } = data;
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

          // the quote changed before anything was sent: no retry, the form
          // shows the new quote before the user submits again
          if (error instanceof QuoteMismatchError) {
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
      collector,
      core,
      refetchScope,
      matomoEventStart,
      matomoEventSuccess,
      onRetry,
      oracle,
      publicClientMainnet,
      refetchQuote,
      shownQuote,
      syncRedeemQueue,
      txFlow,
      txModalStages,
    ],
  );

  return {
    withdraw,
  };
};
