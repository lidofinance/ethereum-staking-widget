import { useCallback, useEffect, useRef } from 'react';
import { Hash } from 'viem';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';
import { useAddressValidation } from 'providers/address-validation-provider';
import { useDappStatus } from 'modules/web3';

import { useAA } from '../use-aa';
import { useSendAACalls } from './use-send-aa-calls';
import { TransactionRevertedError } from '../../utils/transaction-reverted-error';
import { TxSettledError } from '../../utils/tx-settled-error';
import { TxCallbackProps, TxFlowArgs } from './types';

export type TxStagesCallback = (args: TxCallbackProps) => Promise<void>;

/**
 * Hook to handle the transaction flow for both Account Abstraction (AA) and standard transactions.
 * It manages transaction lifecycle callbacks for various stages.
 *
 * @returns A function that initiates the transaction flow with the provided arguments and stage callbacks.
 *
 */
export const useTxFlow = () => {
  const { isAA } = useAA();
  const sendAACalls = useSendAACalls();
  const { validateAddress } = useAddressValidation();
  const { address } = useDappStatus();

  // Is used to memoize txHash to keep track of it across stages.
  const txHash = useRef<Hash | undefined>(undefined);

  // Increase counter when operation ended by UI unmount
  // this invalidates any ongoing operation
  const operationRef = useRef(0);
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      operationRef.current++;
    };
  }, []);

  return useCallback(
    async ({
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
    }: TxFlowArgs) => {
      const operation = ++operationRef.current;
      const isCurrent = () => operationRef.current === operation;

      // Set once a successful receipt is known and cleared when its DONE stage
      // completes. In between, the transaction is done: a failing confirmations
      // read or balance refresh must not be presented as a failed transaction,
      // and never with a Retry. Clearing matters for flows that chain several
      // transactions (approve, then deposit) through one stage callback: the
      // approval settling must not mask a failure of the deposit that follows
      let isSettled = false;
      let isFailureReported = false;
      const toFlowError = (error: unknown) =>
        isSettled ? new TxSettledError(error, txHash.current) : error;

      /**
       * Callback function to handle different stages of the transaction flow.
       * It calls the appropriate callback based on the stage of the transaction.
       *
       * @param args - The arguments for the current stage of the transaction.
       */
      const txStagesCallback = async (txArgs: TxCallbackProps) => {
        if (!isCurrent()) return;
        const args = { ...txArgs, isAA };
        switch (args.stage) {
          case TransactionCallbackStage.SIGN:
            return onSign?.(args);
          case TransactionCallbackStage.RECEIPT:
            // In case of AA sendCalls, the callId is used to track the transaction.
            // But in case of legacy sendTransaction, the payload is the transaction hash.
            // Memoize the txHash for using it in subsequent calls.
            txHash.current = args.payload;
            await onReceipt?.({
              ...args,
              txHashOrCallId:
                'callId' in args ? (args.callId as Hash) : args.payload,
            });
            break;
          case TransactionCallbackStage.DONE:
            isSettled = true;
            try {
              await onSuccess?.({
                ...args,
                txHash: 'txHash' in args ? args.txHash : txHash.current,
              });
            } catch (error) {
              // Report here rather than relying on the SDK rejecting: the L2
              // wrap path fires the SDK call without awaiting it
              isFailureReported = true;
              await onFailure?.({
                ...args,
                stage: TransactionCallbackStage.ERROR,
                error: toFlowError(error),
              });
              throw error;
            }
            isSettled = false;
            txHash.current = undefined; // Reset txHash after success
            break;
          case TransactionCallbackStage.MULTISIG_DONE:
            await onMultisigDone?.(args);
            break;
          case TransactionCallbackStage.ERROR:
            if (isFailureReported) break;
            isFailureReported = true;
            await onFailure?.({
              ...args,
              error: toFlowError('error' in args ? args.error : args.payload),
            });
            break;
          case TransactionCallbackStage.PERMIT:
            await onPermit?.(args);
            break;
          case TransactionCallbackStage.GAS_LIMIT:
            await onGasLimit?.(args);
            break;
          case TransactionCallbackStage.CONFIRMATION:
            // The SDK reports CONFIRMATION and then DONE regardless of the
            // receipt status, so a reverted transaction would be presented as a
            // success. Throwing here skips DONE and surfaces it as a failure.
            if (args.payload?.status === 'reverted') {
              throw new TransactionRevertedError(args.payload);
            }
            isSettled = true;
            await onConfirmation?.(args);
            break;
          default:
            break;
        }
      };

      const result = await validateAddress(address);
      // if address is not valid, or the operation went stale while validating,
      // don't send the transaction
      if (!result || !isCurrent()) return;

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
        if (!isSettled) throw error;
        // The SDK emits no ERROR stage for legacy transactions, so report the
        // settled failure here; swallowing it lets the caller finish as a
        // success (reset form, track completion) since the tx did complete
        if (!isFailureReported) {
          await onFailure?.({
            stage: TransactionCallbackStage.ERROR,
            error: toFlowError(error),
            isAA,
          });
        }
      }
    },
    [isAA, sendAACalls, validateAddress, address],
  );
};
