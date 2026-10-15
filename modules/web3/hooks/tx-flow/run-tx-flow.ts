import type { Hash } from 'viem';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import { TransactionRevertedError } from '../../utils/transaction-reverted-error';
import { TxSettledError } from '../../utils/tx-settled-error';
import { TxStaleError } from '../../utils/tx-stale-error';
import type { TxCallbackProps, TxFlowArgs, TxFlowDeps } from './types';

// Throwing from these aborts the request; later stages only report on a sent tx
const PRE_SEND_STAGES = new Set<TxCallbackProps['stage']>([
  TransactionCallbackStage.GAS_LIMIT,
  TransactionCallbackStage.PERMIT,
  TransactionCallbackStage.SIGN,
]);

/**
 * The transaction state machine behind {@link useTxFlow}, kept free of React
 * so it can be driven directly in tests.
 */
export const runTxFlow = async (
  {
    callsFn,
    sendTransaction,
    onPermit,
    onSign,
    onGasLimit,
    onReceipt,
    onConfirmation,
    onSuccess,
    onFailure,
    onMultisigDone,
  }: TxFlowArgs,
  {
    isAA,
    address,
    validateAddress,
    sendAACalls,
    isCurrent,
    txHash,
  }: TxFlowDeps,
) => {
  // True from a successful receipt until DONE completes: a failure in that
  // window is not a failed transaction and must never get a Retry. Cleared
  // after DONE so a chained transaction (approve, then deposit) reports its own
  let isSettled = false;

  const txStagesCallback = async (txArgs: TxCallbackProps) => {
    if (!isCurrent()) {
      if (PRE_SEND_STAGES.has(txArgs.stage)) throw new TxStaleError();
      return;
    }
    const args = { ...txArgs, isAA };
    switch (args.stage) {
      case TransactionCallbackStage.GAS_LIMIT:
        return onGasLimit?.(args);
      case TransactionCallbackStage.PERMIT:
        return onPermit?.(args);
      case TransactionCallbackStage.SIGN:
        return onSign?.(args);
      case TransactionCallbackStage.RECEIPT:
        // Legacy reports the tx hash here; AA reports a callId and the hash at DONE
        txHash.current = args.payload;
        return onReceipt?.({
          ...args,
          txHashOrCallId:
            'callId' in args ? (args.callId as Hash) : args.payload,
        });
      case TransactionCallbackStage.CONFIRMATION:
        // The SDK reports CONFIRMATION and DONE regardless of receipt status
        if (args.payload?.status === 'reverted') {
          throw new TransactionRevertedError(args.payload);
        }
        isSettled = true;
        return onConfirmation?.(args);
      case TransactionCallbackStage.DONE:
        isSettled = true;
        await onSuccess?.({
          ...args,
          txHash: 'txHash' in args ? args.txHash : txHash.current,
        });
        isSettled = false;
        txHash.current = undefined;
        return;
      case TransactionCallbackStage.MULTISIG_DONE:
        return onMultisigDone?.(args);
      // ERROR is not handled: both senders reject afterwards (the legacy SDK
      // never emits it) and the rejection is handled once below
      default:
        return;
    }
  };

  if (!(await validateAddress(address)) || !isCurrent()) return;

  try {
    // callsFn must be defined for AA transactions. If it's not defined, the transaction will be sent to yourself instead of the smart account.
    if (isAA && callsFn) {
      const calls = await callsFn();
      // building calls can take a while, check again before reaching the wallet
      if (!isCurrent()) return;
      await sendAACalls(calls, async (props) => {
        await txStagesCallback(props);
      });
    } else {
      await sendTransaction(txStagesCallback);
    }
  } catch (error) {
    // The SDK rewraps errors thrown from stage callbacks, so staleness cannot
    // be recovered from the error itself
    if (!isCurrent()) throw new TxStaleError();
    if (!isSettled) throw error;
    // The tx did complete: with a handler the caller finishes as a success
    // (reset form, track completion); without one its own catch must show it
    const settledError = new TxSettledError(error, txHash.current);
    if (!onFailure) throw settledError;
    await onFailure({
      stage: TransactionCallbackStage.ERROR,
      error: settledError,
      isAA,
    });
  }
};
