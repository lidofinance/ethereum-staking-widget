import { useCallback, useRef } from 'react';
import { Hash } from 'viem';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';
import { useAddressValidation } from 'providers/address-validation-provider';
import { useDappStatus } from 'modules/web3';

import { useAA } from '../use-aa';
import { useSendAACalls } from './use-send-aa-calls';
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
      /**
       * Callback function to handle different stages of the transaction flow.
       * It calls the appropriate callback based on the stage of the transaction.
       *
       * @param args - The arguments for the current stage of the transaction.
       */
      const txStagesCallback = async (txArgs: TxCallbackProps) => {
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
            await onSuccess?.({
              ...args,
              txHash: 'txHash' in args ? args.txHash : txHash.current,
            });
            txHash.current = undefined; // Reset txHash after success
            break;
          case TransactionCallbackStage.MULTISIG_DONE:
            await onMultisigDone?.(args);
            break;
          case TransactionCallbackStage.ERROR:
            await onFailure?.({
              ...args,
              error: 'error' in args ? args.error : args.payload,
            });
            break;
          case TransactionCallbackStage.PERMIT:
            await onPermit?.(args);
            break;
          case TransactionCallbackStage.GAS_LIMIT:
            await onGasLimit?.(args);
            break;
          case TransactionCallbackStage.CONFIRMATION:
            await onConfirmation?.(args);
            break;
          default:
            break;
        }
      };

      const result = await validateAddress(address);
      // if address is not valid, don't send the transaction
      if (!result) return;

      // callsFn must be defined for AA transactions. If it's not defined, the transaction will be sent to yourself instead of the smart account.
      if (isAA && callsFn) {
        const calls = await callsFn();
        await sendAACalls(calls, async (props) => {
          await txStagesCallback(props);
        });
      } else {
        await sendTransaction(txStagesCallback);
      }
    },
    [isAA, sendAACalls, validateAddress, address],
  );
};
