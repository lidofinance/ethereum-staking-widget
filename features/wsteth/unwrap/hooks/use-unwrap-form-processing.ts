import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import {
  type TransactionCallback,
  TransactionCallbackStage,
} from '@lidofinance/lido-ethereum-sdk/core';

import {
  useAA,
  useDappStatus,
  useLidoSDK,
  useLidoSDKL2,
  useSendAACalls,
} from 'modules/web3';

import type { UnwrapFormInputType } from '../unwrap-form-context';
import { useUnwrapTxOnL2Approve } from './use-unwrap-tx-on-l2-approve';
import { useTxModalStagesUnwrap } from './use-tx-modal-stages-unwrap';

import type { Address, Hash } from 'viem';

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
  const sendAACalls = useSendAACalls();
  const { address } = useDappStatus();
  const { txModalStages } = useTxModalStagesUnwrap();
  const { stETH, wrap } = useLidoSDK();
  const { l2, isL2 } = useLidoSDKL2();

  const {
    isApprovalNeededBeforeUnwrap: isApprovalNeededBeforeUnwrapOnL2,
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

        if (isAA) {
          const calls: unknown[] = [];
          if (isL2) {
            const l2WrapCall = await l2.wrapWstethToStethPopulateTx({
              value: amount,
            });
            if (isApprovalNeededBeforeUnwrapOnL2) {
              const l2ApproveCall = await l2.wsteth.populateApprove({
                amount,
                to: l2WrapCall.to as Address,
              });
              calls.push({
                to: l2ApproveCall.to,
                data: l2ApproveCall.data,
              });
            }
            calls.push({
              to: l2WrapCall.to,
              data: l2WrapCall.data,
            });
          } else {
            const { to, data } = await wrap.unwrapPopulateTx({ value: amount });
            calls.push({
              to,
              data,
            });
          }

          await sendAACalls(calls, async (props) => {
            switch (props.stage) {
              case TransactionCallbackStage.SIGN:
                txModalStages.sign(amount, willReceive);
                break;
              case TransactionCallbackStage.RECEIPT:
                txModalStages.pending(
                  amount,
                  willReceive,
                  props.callId as Hash,
                  isAA,
                );
                break;
              case TransactionCallbackStage.DONE: {
                const balance = await onUnwrapConfirm();
                txModalStages.success(balance, props.txHash);
                break;
              }
              case TransactionCallbackStage.ERROR: {
                txModalStages.failed(props.error, onRetry);
                break;
              }
              default:
                break;
            }
          });

          return true;
        }

        let txHash: Hash | undefined = undefined;

        if (isL2 && isApprovalNeededBeforeUnwrapOnL2) {
          await processApproveTxOnL2({ onRetry });
        }

        const callback: TransactionCallback = async ({ stage, payload }) => {
          switch (stage) {
            case TransactionCallbackStage.SIGN:
              txModalStages.sign(amount, willReceive);
              break;
            case TransactionCallbackStage.RECEIPT:
              // the payload here is txHash
              txModalStages.pending(amount, willReceive, payload);
              txHash = payload;
              break;
            case TransactionCallbackStage.DONE: {
              const balance = await onUnwrapConfirm();
              txModalStages.success(balance, txHash);
              break;
            }
            case TransactionCallbackStage.MULTISIG_DONE:
              txModalStages.successMultisig();
              break;
            case TransactionCallbackStage.ERROR:
              txModalStages.failed(payload, onRetry);
              break;
            default:
          }
        };

        if (isL2) {
          // The operation 'wstETH to stETH' on L2 is 'wrap'
          await l2.wrapWstethToSteth({
            value: amount,
            callback,
          });
        } else {
          await wrap.unwrap({
            value: amount,
            callback,
          });
        }

        return true;
      } catch (error: any) {
        console.warn(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      address,
      l2,
      wrap,
      isAA,
      isL2,
      isApprovalNeededBeforeUnwrapOnL2,
      txModalStages,
      sendAACalls,
      onConfirm,
      stETH,
      processApproveTxOnL2,
      onRetry,
    ],
  );
};
