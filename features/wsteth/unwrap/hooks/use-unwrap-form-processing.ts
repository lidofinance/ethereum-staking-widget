import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import type { Address } from 'viem';

import {
  isStepSettled,
  useAA,
  useDappStatus,
  useLidoSDK,
  useLidoSDKL2,
  useTxFlow,
  TxSettledError,
  TxFlowInterruptedError,
} from 'modules/web3';

import { ErrorMessage } from 'utils/getErrorMessage';
import { warnError } from 'utils/warn-error';
import { withFallback } from 'utils/with-fallback';

import type { UnwrapFormInputType } from '../unwrap-form-context';
import { useTxModalStagesUnwrap } from './use-tx-modal-stages-unwrap';

type UseUnwrapFormProcessorArgs = {
  // refreshes the form data and the allowance; never rejects
  onConfirm: () => Promise<void>;
  onRetry?: () => void;
};

// the steps of an unwrap, the first one only on L2 short of allowance
const STEP = { approve: 'approve', unwrap: 'unwrap' } as const;

// what every stage of an unwrap needs, read once before the first step
type UnwrapData = {
  amount: bigint;
  address: Address;
  // the stETH the modal shows, read at submit time
  willReceive: bigint;
  // On L2 the stETH token pulls the wstETH, so it needs an allowance first.
  // Read here rather than taken from the form state, so a retry after a
  // confirmed approval never approves again
  needsApprove: boolean;
};

// The amount received is not re-checked before sending: the conversion has
// no minimum-out parameter to bind it to, and it is value-neutral (the same
// shares change form at the protocol's own rate), so a rate change after an
// oracle report changes the token count, not what the user holds
export const useUnwrapFormProcessor = ({
  onConfirm,
  onRetry,
}: UseUnwrapFormProcessorArgs) => {
  const { isAA } = useAA();
  const { address } = useDappStatus();
  const { txModalStages } = useTxModalStagesUnwrap();
  const { stETH, wrap } = useLidoSDK();
  const { l2, isL2Wrap } = useLidoSDKL2();
  const txFlow = useTxFlow();

  return useCallback(
    async ({ amount }: UnwrapFormInputType): Promise<boolean> => {
      const { isSuccess } = await txFlow<UnwrapData>({
        prepare: async () => {
          invariant(amount, 'amount is null');
          invariant(address, 'account is not defined');
          return {
            amount,
            address,
            willReceive: await (isL2Wrap
              ? l2.steth.convertToSteth(amount)
              : wrap.convertWstethToSteth(amount)),
            // the L1 unwrap burns the caller's own wstETH: no allowance there
            needsApprove:
              isL2Wrap &&
              (await l2.getWstethForWrapAllowance(address)) < amount,
          };
        },
        // the approval joins the batch for AA wallets and goes as a separate
        // transaction otherwise
        callsFn: async ({ data }) => {
          const props = { value: data.amount };
          if (!isL2Wrap) {
            return [
              { stepId: STEP.unwrap, ...(await wrap.unwrapPopulateTx(props)) },
            ];
          }
          // wstETH → stETH on L2 is the stETH token's wrap
          return [
            data.needsApprove && {
              stepId: STEP.approve,
              ...(await l2.approveWstethForWrapPopulateTx(props)),
            },
            {
              stepId: STEP.unwrap,
              ...(await l2.wrapWstethToStethPopulateTx(props)),
            },
          ];
        },
        sendStep: async (step, txStagesCallback, { data }) => {
          const props = { value: data.amount, callback: txStagesCallback };
          if (step.stepId === STEP.approve) {
            await l2.approveWstethForWrap(props);
            return;
          }
          if (isL2Wrap) {
            await l2.wrapWstethToSteth(props);
            return;
          }
          await wrap.unwrap(props);
        },
        onSign: ({ ctx: { stepId, data } }) =>
          stepId === STEP.approve
            ? txModalStages.signApproval(data.amount)
            : txModalStages.sign(data.amount, data.willReceive),
        onReceipt: ({ txHashOrCallId, ctx: { stepId, data } }) =>
          stepId === STEP.approve
            ? txModalStages.pendingApproval(data.amount, txHashOrCallId)
            : txModalStages.pending(
                data.amount,
                data.willReceive,
                txHashOrCallId,
                isAA,
              ),
        onSuccess: async ({ txHash, ctx: { stepId, data } }) => {
          if (stepId !== STEP.unwrap) return;
          const [, balance] = await Promise.all([
            // never rejects: the form refetches are settled inside
            onConfirm(),
            // a failed read must not fail a settled tx: the modal drops the balance
            withFallback(
              isL2Wrap
                ? l2.steth.balance(data.address)
                : stETH.balance(data.address),
              undefined,
              {
                onError: warnError(
                  '[useUnwrapFormProcessor] post-unwrap balance read failed',
                ),
              },
            ),
          ]);
          txModalStages.success(balance, txHash);
        },
        onMultisigDone: ({ ctx }) => {
          if (ctx.stepId === STEP.unwrap) txModalStages.successMultisig();
        },
        onFailure: async ({ error, ctx }) => {
          console.warn(error);
          // the allowance changed under the form: refresh it before a retry
          if (isStepSettled(ctx, STEP.approve)) await onConfirm();
          // The approval settled but its confirmation read failed, so the
          // SDK never got to the unwrap. Not a completed unwrap: keep the
          // amount and offer to continue. Any other failure after the
          // approval shows as is: a retry reads the allowance and goes
          // straight to the unwrap
          if (ctx.stepId === STEP.approve && error instanceof TxSettledError) {
            txModalStages.failed(
              new TxFlowInterruptedError(
                ErrorMessage.UNWRAP_INTERRUPTED,
                error.cause,
              ),
              onRetry,
            );
            return;
          }
          txModalStages.failed(error, onRetry);
        },
      });

      // unwrapped (or proposed to a multisig): the form resets
      return isSuccess;
    },
    [
      address,
      isL2Wrap,
      l2,
      wrap,
      stETH,
      txFlow,
      onConfirm,
      onRetry,
      txModalStages,
      isAA,
    ],
  );
};
