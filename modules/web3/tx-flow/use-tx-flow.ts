import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAddressValidation } from 'providers/address-validation-provider';
import { useDappStatus } from 'modules/web3';

import { useAA } from '../hooks/use-aa';
// the concrete files, not the provider barrel: that one leads back here
import { useLidoSDK } from '../web3-provider/lido-sdk';
import { useLidoSDKL2 } from '../web3-provider/lido-sdk-l2';
import { useSendAACalls } from './use-send-aa-calls';
import { TxSentDataUnavailableError } from '../utils/errors';
import { runTxFlow } from './run-tx-flow';
import {
  type TxBlock,
  isTxBlockOf,
  recordTxBlock,
  waitForBlock,
} from './tx-block';
import { TxCallbackProps, TxFlowArgs, type TxFlow } from './types';

export type TxStagesCallback = (args: TxCallbackProps) => Promise<void>;

type UseTxFlowArgs = {
  // Before a flow reads anything, wait until the RPC serves the block of the
  // last tx this hook got into one. An RPC can lag behind the receipt it
  // returned (MetaMask answers `latest` reads at a block it polls every 20s),
  // so a retry right after an approval would read the old allowance and
  // approve again. Fail-open: see `waitForBlock`. On by default: only a flow
  // whose reads cannot be affected by its own previous tx may turn it off
  waitForPrevPendingTx?: boolean;
};

/**
 * Hook to handle the transaction flow for both Account Abstraction (AA) and standard transactions.
 * It manages transaction lifecycle callbacks for various stages.
 * The state machine itself lives in {@link runTxFlow}.
 *
 * @returns A function that initiates the transaction flow with the provided arguments and stage callbacks.
 *
 */
export const useTxFlow = ({
  waitForPrevPendingTx = true,
}: UseTxFlowArgs = {}): TxFlow => {
  const { isAA } = useAA();
  const sendAACalls = useSendAACalls();
  const { validateAddress } = useAddressValidation();
  const { address } = useDappStatus();
  const queryClient = useQueryClient();
  // the client the flows read with, on the chain they send on
  const { core: l1core } = useLidoSDK();
  const { core: l2core, isL2 } = useLidoSDKL2();
  const core = isL2 ? l2core : l1core;

  // Increase counter when operation ended by UI unmount
  // this invalidates any ongoing operation
  const operationRef = useRef(0);
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      operationRef.current++;
    };
  }, []);

  // the latest block a tx of this hook got into
  const lastTxBlockRef = useRef<TxBlock | null>(null);

  return useCallback(
    async <TData = undefined>(args: TxFlowArgs<TData>) => {
      const operation = ++operationRef.current;
      const isCurrent = () => operationRef.current === operation;
      const { chainId, publicClient } = core;

      // no account, nothing of its own to wait for
      const scope = address ? { chainId, address } : null;

      const onTxBlock = (blockNumber: bigint | undefined) => {
        // nothing to wait for without a block number
        if (!scope || typeof blockNumber !== 'bigint') return;
        lastTxBlockRef.current = recordTxBlock(
          lastTxBlockRef.current,
          scope,
          blockNumber,
        );
      };

      const waitForPrevTx = async () => {
        const last = lastTxBlockRef.current;
        if (!last || !scope || !isTxBlockOf(last, scope)) return;
        const isReached = await waitForBlock({
          getLatestBlockNumber: async () =>
            (await publicClient.getBlock({ blockTag: 'latest' })).number,
          blockNumber: last.blockNumber,
          isCurrent,
        });
        // caught up: later flows skip the read until another tx lands
        if (isReached && lastTxBlockRef.current === last) {
          lastTxBlockRef.current = null;
        }
      };

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
          isCurrent,
          onTxBlock,
          waitForPrevTx: waitForPrevPendingTx ? waitForPrevTx : undefined,
        });
        refetchOnUnknownOutcome(result.error);
        return result;
      } catch (error) {
        refetchOnUnknownOutcome(error);
        throw error;
      }
    },
    [
      isAA,
      sendAACalls,
      validateAddress,
      address,
      queryClient,
      core,
      waitForPrevPendingTx,
    ],
  );
};
