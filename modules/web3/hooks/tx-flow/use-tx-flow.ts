import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAddressValidation } from 'providers/address-validation-provider';
import { useDappStatus } from 'modules/web3';

import { useAA } from '../use-aa';
import { useSendAACalls } from './use-send-aa-calls';
import { TxSentDataUnavailableError } from '../../utils/errors';
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
  const queryClient = useQueryClient();

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
    async <TData = undefined>(args: TxFlowArgs<TData>) => {
      const operation = ++operationRef.current;
      // A transaction that was sent but never read back may have changed
      // balances, allowances and requests under the forms: refetch what the
      // caller scoped, or everything the UI holds, so the state is current
      // even before the reload it asks for
      const refetchOnUnknownOutcome = (error: unknown) => {
        if (!(error instanceof TxSentDataUnavailableError)) return;
        const { refetchScope } = args;
        if (!refetchScope) {
          void queryClient.invalidateQueries();
          return;
        }
        for (const queryKey of refetchScope) {
          void queryClient.invalidateQueries({ queryKey });
        }
      };
      try {
        const result = await runTxFlow<TData>(args, {
          isAA,
          address,
          validateAddress,
          sendAACalls,
          isCurrent: () => operationRef.current === operation,
        });
        refetchOnUnknownOutcome(result.error);
        return result;
      } catch (error) {
        refetchOnUnknownOutcome(error);
        throw error;
      }
    },
    [isAA, sendAACalls, validateAddress, address, queryClient],
  );
};
