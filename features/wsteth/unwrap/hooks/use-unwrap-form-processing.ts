import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import {
  useAA,
  useDappStatus,
  useLidoSDK,
  useLidoSDKL2,
  useTxFlow,
} from 'modules/web3';

import type { UnwrapFormInputType } from '../unwrap-form-context';
import { useUnwrapTxOnL2Approve } from './use-unwrap-tx-on-l2-approve';
import { useTxModalStagesUnwrap } from './use-tx-modal-stages-unwrap';

export type UnwrapFormApprovalData = ReturnType<typeof useUnwrapTxOnL2Approve>;

type UseUnwrapFormProcessorArgs = {
  approvalDataOnL2: UnwrapFormApprovalData;
  onConfirm: () => Promise<void>;
  onRetry?: () => void;
};

export const useUnwrapFormProcessor = ({
  approvalDataOnL2,
  onConfirm,
  onRetry,
}: UseUnwrapFormProcessorArgs) => {
  const { isAA } = useAA();
  const { address } = useDappStatus();
  const { txModalStages } = useTxModalStagesUnwrap();
  const { stETH, wrap } = useLidoSDK();
  const { l2, isL2 } = useLidoSDKL2();
  const txFlow = useTxFlow();

  const {
    needsApprove: needsApproveL2,
    processApproveTx: processApproveTxOnL2,
  } = approvalDataOnL2;

  return useCallback(
    async ({ amount }: UnwrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');

        const willReceive = await (isL2
          ? l2.steth.convertToSteth(amount)
          : wrap.convertWstethToSteth(amount));

        const onUnwrapConfirm = async () => {
          const [, balance] = await Promise.all([
            onConfirm?.(),
            isL2 ? l2.steth.balance(address) : stETH.balance(address),
          ]);
          return balance;
        };

        await txFlow({
          callsFn: async () => {
            let calls;
            const args = {
              value: amount,
            };
            if (isL2) {
              calls = await Promise.all([
                needsApproveL2 && l2.approveWstethForWrapPopulateTx(args),
                l2.wrapWstethToStethPopulateTx(args),
              ]);
            } else {
              calls = [await wrap.unwrapPopulateTx(args)];
            }
            return calls;
          },
          sendTransaction: async (txStagesCallback) => {
            if (isL2 && needsApproveL2) {
              await processApproveTxOnL2({ onRetry });
            }

            if (isL2) {
              // The operation 'wstETH to stETH' on L2 is 'wrap'
              await l2.wrapWstethToSteth({
                value: amount,
                callback: txStagesCallback,
              });
            } else {
              await wrap.unwrap({
                value: amount,
                callback: txStagesCallback,
              });
            }
          },
          onSign: () => {
            txModalStages.sign(amount, willReceive);
          },
          onReceipt: ({ txHashOrCallId }) => {
            txModalStages.pending(amount, willReceive, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            const balance = await onUnwrapConfirm();
            txModalStages.success(balance, txHash);
          },
          onFailure: ({ error }) => {
            txModalStages.failed(error, onRetry);
          },
          onMultisigDone: () => {
            txModalStages.successMultisig();
          },
        });

        return true;
      } catch (error: any) {
        console.warn(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      address,
      isL2,
      l2,
      wrap,
      txFlow,
      onConfirm,
      stETH,
      needsApproveL2,
      processApproveTxOnL2,
      onRetry,
      txModalStages,
      isAA,
    ],
  );
};
