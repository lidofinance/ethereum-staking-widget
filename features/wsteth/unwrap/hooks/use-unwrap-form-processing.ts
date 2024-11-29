/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { zeroHash, type Hash } from 'viem';
import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

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
  const { isDappActiveOnL2, address } = useDappStatus();
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

        const willReceive = await (isDappActiveOnL2
          ? l2.steth.convertToSteth(amount)
          : wrap.convertWstethToSteth(amount));

        if (isAA) {
          const calls: unknown[] = [];
          if (isL2) {
            const l2Steth = await l2.getContract();
            const l2Wsteth = await l2.wsteth.getContract();
            if (isApprovalNeededBeforeUnwrapOnL2) {
              calls.push({
                to: l2Wsteth.address,
                abi: l2Wsteth.abi,
                functionName: 'approve',
                args: [l2Steth.address, amount] as const,
              });
            }
            calls.push({
              to: l2Steth.address,
              abi: l2Steth.abi,
              functionName: 'wrap',
              args: [amount] as const,
            });
          } else {
            const wsteth = await wrap.getContractWstETH();
            calls.push({
              to: wsteth.address,
              abi: wsteth.abi,
              functionName: 'unwrap',
              args: [amount] as const,
            });
          }

          txModalStages.sign(amount, willReceive);
          const callStatus = await sendAACalls(calls, (props) => {
            if (props.stage === 'sent')
              txModalStages.pending(
                amount,
                willReceive,
                props.callId as Hash,
                isAA,
              );
          });

          const [, balance] = await Promise.all([
            onConfirm?.(),
            isDappActiveOnL2
              ? l2.steth.balance(address)
              : stETH.balance(address),
          ]);

          const txHash = callStatus.receipts
            ? callStatus.receipts[callStatus.receipts.length - 1]
                .transactionHash
            : zeroHash;

          txModalStages.success(balance, txHash);

          return true;
        }

        let txHash: Hash | undefined = undefined;

        if (isL2 && isApprovalNeededBeforeUnwrapOnL2) {
          await processApproveTxOnL2({ onRetry });
        }

        if (isL2) {
          // The operation 'wstETH to stETH' on L2 is 'wrap'
          await l2.wrapWstethToSteth({
            value: amount,
            callback: async ({ stage, payload }) => {
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
                  const [, balance] = await Promise.all([
                    onConfirm?.(),
                    isDappActiveOnL2
                      ? l2.steth.balance(address)
                      : stETH.balance(address),
                  ]);
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
            },
          });
        } else {
          await wrap.unwrap({
            value: amount,
            callback: async ({ stage, payload }) => {
              switch (stage) {
                case TransactionCallbackStage.SIGN:
                  txModalStages.sign(amount, willReceive);
                  break;
                case TransactionCallbackStage.RECEIPT:
                  txModalStages.pending(amount, willReceive, payload);
                  txHash = payload; // the payload here is txHash
                  break;
                case TransactionCallbackStage.DONE: {
                  const [, balance] = await Promise.all([
                    onConfirm?.(),
                    isDappActiveOnL2
                      ? l2.steth.balance(address)
                      : stETH.balance(address),
                  ]);
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
            },
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
      isDappActiveOnL2,
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
