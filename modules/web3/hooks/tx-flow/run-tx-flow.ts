import type { Hash } from 'viem';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import {
  SendCallsError,
  TransactionRevertedError,
  TxSentDataUnavailableError,
  TxSettledError,
  TxStaleError,
} from '../../utils/errors';
import { isStepProposed, isStepSent, isStepSettled } from './context';
import type {
  LegacyTxFlowArgs,
  StageCallbacks,
  TxCallbackProps,
  TxFlowArgs,
  TxFlowContext,
  TxFlowDeps,
  TxFlowResult,
  TxStep,
  TxStepStatus,
} from './types';

// Throwing from these aborts the request; later stages only report on a sent tx
const PRE_SEND_STAGES = new Set<TxCallbackProps['stage']>([
  TransactionCallbackStage.GAS_LIMIT,
  TransactionCallbackStage.PERMIT,
  TransactionCallbackStage.SIGN,
]);

/**
 * The transaction state machine behind {@link useTxFlow}, kept free of React
 * so it can be driven directly in tests. Runs a legacy flow (one
 * `sendTransaction`) or a stepwise one (`callsFn` + `sendStep`), see
 * {@link TxFlowArgs}. Resolves with the final context and the flags derived
 * from it, see {@link TxFlowResult}.
 */
export const runTxFlow = async <TData = undefined>(
  args: TxFlowArgs<TData>,
  { isAA, address, validateAddress, sendAACalls, isCurrent }: TxFlowDeps,
): Promise<TxFlowResult<TData>> => {
  const { callsFn } = args;
  // a legacy flow carries no data (TData is undefined there), so both shapes
  // share the stage callbacks once the data type is fixed
  const {
    onPermit,
    onSign,
    onGasLimit,
    onReceipt,
    onConfirmation,
    onSuccess,
    onFailure,
    onMultisigDone,
  } = args as StageCallbacks<TData>;
  const isStepwise = !!args.sendStep;

  // True from a successful receipt until DONE completes: a failure in that
  // window is not a failed transaction and must never get a Retry. Cleared
  // after DONE so a chained transaction (approve, then deposit) reports its own
  let isSettled = false;
  // True from the receipt (a hash or call id came back) until the outcome is
  // known: a confirmation, a multisig proposal or DONE. A failure in that
  // window left a transaction on the network whose fate was never read, so
  // it must not get a Retry either; the id is kept for the report
  let isSent = false;
  let sentId: string | undefined;
  // The hash of the current transaction: a legacy sender reports it at
  // RECEIPT and the flow hands it to onSuccess at DONE; cleared after, so a
  // chained transaction reports its own
  let currentTxHash: Hash | undefined;

  const ctx: TxFlowContext<TData | undefined> = {
    stepId: undefined,
    calls: [],
    status: {},
    isAA,
    data: undefined,
  };
  // the data is in place for every stage past `prepare`; `onFailure` is
  // typed to expect it missing
  const snapshot = () =>
    ({
      ...ctx,
      calls: [...ctx.calls],
      status: { ...ctx.status },
    }) as TxFlowContext<TData>;
  const landed = (stepId?: string) =>
    !!stepId && (isStepSettled(ctx, stepId) || isStepProposed(ctx, stepId));
  const result = (
    flags: Partial<Pick<TxFlowResult<TData>, 'isAborted' | 'error'>> = {},
  ): TxFlowResult<TData> => {
    const lastStepId = ctx.calls.at(-1)?.stepId;
    const isSuccess = isStepwise ? landed(lastStepId) : !flags.isAborted;
    const isInterrupted =
      isStepwise &&
      !isSuccess &&
      !!lastStepId &&
      !isStepSent(ctx, lastStepId) &&
      ctx.calls.some((call) => landed(call.stepId));
    return {
      ctx: snapshot(),
      isSuccess,
      isInterrupted,
      isAborted: false,
      ...flags,
    };
  };
  const aborted = () => result({ isAborted: true });
  // an AA batch is one transaction: every step moves together
  const setStatus = (status: TxStepStatus) => {
    const stepIds = isAA ? ctx.calls.map((call) => call.stepId) : [ctx.stepId];
    for (const stepId of stepIds) if (stepId) ctx.status[stepId] = status;
  };

  // Records how far the current transaction got. Runs for a stale flow too:
  // what reached the chain decides how a later failure is reported, whoever
  // is left to report it to
  const track = (txArgs: TxCallbackProps) => {
    switch (txArgs.stage) {
      case TransactionCallbackStage.RECEIPT:
        setStatus('sent');
        isSent = true;
        sentId = 'callId' in txArgs ? txArgs.callId : txArgs.payload;
        // Legacy reports the tx hash here; AA reports a callId and the hash at DONE
        currentTxHash = txArgs.payload;
        break;
      case TransactionCallbackStage.CONFIRMATION:
        // the outcome is known either way, a revert included
        isSent = false;
        // The SDK reports CONFIRMATION and DONE regardless of receipt status
        if (txArgs.payload?.status === 'reverted') {
          throw new TransactionRevertedError(txArgs.payload);
        }
        setStatus('settled');
        isSettled = true;
        break;
      case TransactionCallbackStage.DONE:
        setStatus('done');
        isSent = false;
        isSettled = true;
        break;
      case TransactionCallbackStage.MULTISIG_DONE:
        setStatus('proposed');
        isSent = false;
        break;
      default:
        break;
    }
  };

  // Hands the stage to the caller's callback
  const report = async (txArgs: TxCallbackProps) => {
    const args = { ...txArgs, isAA, ctx: snapshot() };
    switch (args.stage) {
      case TransactionCallbackStage.GAS_LIMIT:
        return onGasLimit?.(args);
      case TransactionCallbackStage.PERMIT:
        return onPermit?.(args);
      case TransactionCallbackStage.SIGN:
        return onSign?.(args);
      case TransactionCallbackStage.RECEIPT:
        return onReceipt?.({
          ...args,
          txHashOrCallId:
            'callId' in args ? (args.callId as Hash) : args.payload,
        });
      case TransactionCallbackStage.CONFIRMATION:
        return onConfirmation?.(args);
      case TransactionCallbackStage.DONE:
        return onSuccess?.({
          ...args,
          txHash: 'txHash' in args ? args.txHash : currentTxHash,
        });
      case TransactionCallbackStage.MULTISIG_DONE:
        return onMultisigDone?.(args);
      // ERROR is not handled: both senders reject afterwards (the legacy SDK
      // never emits it) and the rejection is handled once below
      default:
        return;
    }
  };

  const txStagesCallback = async (txArgs: TxCallbackProps) => {
    track(txArgs);
    const isPreSend = PRE_SEND_STAGES.has(txArgs.stage);
    // a stale flow neither reaches the wallet nor reports stages
    if (isPreSend && !isCurrent()) throw new TxStaleError();
    const value = isCurrent() ? await report(txArgs) : undefined;
    // The callback may await (a modal, a read) and a newer flow may start
    // meanwhile: the sender goes on to the wallet right after this returns
    if (isPreSend && !isCurrent()) throw new TxStaleError();
    if (txArgs.stage === TransactionCallbackStage.DONE) {
      // reached only when onSuccess did not fail: a chained transaction
      // reports its own outcome and hash
      isSettled = false;
      currentTxHash = undefined;
    }
    return value;
  };

  if (!(await validateAddress(address)) || !isCurrent()) return aborted();

  try {
    if (args.sendStep) {
      if (args.prepare) {
        ctx.data = await args.prepare(snapshot() as TxFlowContext<undefined>);
        if (!isCurrent()) return aborted();
      }
      const steps = (await args.callsFn(snapshot())).filter(
        (call): call is TxStep => !!call,
      );
      ctx.calls = steps;
      // building calls can take a while, check again before reaching the wallet
      if (!isCurrent()) return aborted();
      if (isAA) {
        ctx.stepId = steps.at(-1)?.stepId;
        await sendAACalls(steps, async (props) => {
          await txStagesCallback(props);
        });
      } else {
        for (const step of steps) {
          ctx.stepId = step.stepId;
          await args.sendStep(step, txStagesCallback, snapshot());
        }
      }
    } else if (isAA && callsFn) {
      // callsFn must be defined for AA transactions. If it's not defined, the transaction will be sent to yourself instead of the smart account.
      const calls = await (callsFn as LegacyTxFlowArgs['callsFn'] & object)(
        snapshot() as TxFlowContext<undefined>,
      );
      // building calls can take a while, check again before reaching the wallet
      if (!isCurrent()) return aborted();
      await sendAACalls(calls, async (props) => {
        await txStagesCallback(props);
      });
    } else {
      await args.sendTransaction(txStagesCallback);
    }
  } catch (error) {
    // What landed is told apart before anything else, a stale flow included:
    // a tx that settled is not a failed one, and one that was sent but never
    // read back may have landed, so neither gets a Retry. A sender that
    // already knows the outcome (an AA batch that failed or reverted) keeps
    // its own error
    const reported = isSettled
      ? new TxSettledError(error, currentTxHash)
      : isSent &&
          !(error instanceof SendCallsError) &&
          !(error instanceof TxSentDataUnavailableError)
        ? new TxSentDataUnavailableError(error, sentId)
        : error;
    const mayHaveLanded =
      reported instanceof TxSettledError ||
      reported instanceof TxSentDataUnavailableError;
    // A stale flow reports nothing: its UI is gone or shows a newer flow. A
    // stepwise one resolves with the context saying what landed; a legacy one
    // rejects, with the outcome when a tx may have landed. The SDK rewraps
    // errors thrown from stage callbacks, so staleness itself is restated
    if (!isCurrent()) {
      if (isStepwise) {
        return result({
          isAborted: true,
          error: mayHaveLanded ? reported : undefined,
        });
      }
      throw mayHaveLanded ? reported : new TxStaleError();
    }
    // The tx did complete: with a handler the caller finishes as a success
    // (reset form, track completion); without one its own catch must show it.
    // A stepwise flow reports every failure here, with the context saying
    // what landed; a legacy one only the settled ones
    if ((!isStepwise && !isSettled) || !onFailure) throw reported;
    await onFailure({
      stage: TransactionCallbackStage.ERROR,
      error: reported,
      isAA,
      ctx: snapshot(),
    });
    return result({ error: reported });
  }
  return result();
};
