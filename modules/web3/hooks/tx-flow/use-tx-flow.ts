import { useCallback, useEffect, useRef } from 'react';
import { Hash } from 'viem';
import { useAddressValidation } from 'providers/address-validation-provider';
import { useDappStatus } from 'modules/web3';

import { useAA } from '../use-aa';
import { useSendAACalls } from './use-send-aa-calls';
import { runTxFlow } from './run-tx-flow';
import { TxCallbackProps, TxFlowArgs } from './types';

export type TxStagesCallback = (args: TxCallbackProps) => Promise<void>;

/**
 * Hook to handle the transaction flow for both Account Abstraction (AA) and standard transactions.
 * It manages transaction lifecycle callbacks for various stages.
 * The state machine itself lives in {@link runTxFlow}.
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
    (args: TxFlowArgs) => {
      const operation = ++operationRef.current;
      return runTxFlow(args, {
        isAA,
        address,
        validateAddress,
        sendAACalls,
        txHash,
        isCurrent: () => operationRef.current === operation,
      });
    },
    [isAA, sendAACalls, validateAddress, address],
  );
};
