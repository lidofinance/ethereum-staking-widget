import { zeroHash, type Hash } from 'viem';
import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import { config } from 'config';
import { MockLimitReachedError } from 'features/stake/stake-form/utils';
import {
  useAA,
  useSendAACalls,
  useDappStatus,
  useLidoSDK,
  useLidoSDKL2,
} from 'modules/web3';

import type {
  WrapFormApprovalData,
  WrapFormInputType,
} from '../wrap-form-context';
import { TOKENS_TO_WRAP } from '../../shared/types';
import { useTxModalWrap } from './use-tx-modal-stages-wrap';

type UseWrapFormProcessorArgs = {
  approvalDataOnL1: WrapFormApprovalData;
  onConfirm: () => Promise<void>;
  onRetry?: () => void;
};

export const useWrapFormProcessor = ({
  approvalDataOnL1,
  onConfirm,
  onRetry,
}: UseWrapFormProcessorArgs) => {
  const { address } = useDappStatus();
  const { wrap, wstETH, stETH } = useLidoSDK();
  const { isAA } = useAA();
  const sendAACalls = useSendAACalls();
  const { l2, isL2 } = useLidoSDKL2();
  const { txModalStages } = useTxModalWrap();

  const {
    isApprovalNeededBeforeWrap: isApprovalNeededBeforeWrapOnL1,
    processApproveTx: processApproveTxOnL1,
  } = approvalDataOnL1;

  return useCallback(
    async ({ amount, token }: WrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');

        const willReceive = await (isL2
          ? l2.steth.convertToShares(amount)
          : wrap.convertStethToWsteth(amount));

        //
        // ERC5792 flow
        //
        if (isAA) {
          const calls: unknown[] = [];
          // unwrap steth to wsteth on l2
          if (isL2) {
            const l2Steth = await l2.getContract();
            calls.push({
              to: l2Steth.address,
              abi: l2Steth.abi,
              functionName: 'unwrap',
              args: [amount] as const,
            });
            // wrap steth to wsteth
          } else if (token === TOKENS_TO_WRAP.stETH) {
            const wrapContract = await wrap.getContractWstETH();
            const stethContract = await stETH.getContract();

            if (isApprovalNeededBeforeWrapOnL1) {
              calls.push({
                to: stethContract.address,
                abi: stethContract.abi,
                functionName: 'approve',
                args: [wrapContract.address, amount] as const,
              });
            }
            calls.push({
              to: wrapContract.address,
              abi: wrapContract.abi,
              functionName: 'wrap',
              args: [amount] as const,
            });
            // wrap eth to wsteth
          } else {
            const wrapContract = await wrap.getContractWstETH();
            calls.push({
              to: wrapContract.address,
              value: amount,
            });
          }

          txModalStages.sign(amount, token, willReceive);
          const callStatus = await sendAACalls(calls, (props) => {
            if (props.stage === 'sent')
              txModalStages.pending(
                amount,
                token,
                willReceive,
                props.callId as Hash,
                isAA,
              );
          });

          const [, balance] = await Promise.all([
            onConfirm?.(),
            isL2 ? l2.wsteth.balance(address) : wstETH.balance(address),
          ]);
          // extract last receipt if there was no atomic batch
          const txHash = callStatus.receipts
            ? callStatus.receipts[callStatus.receipts.length - 1]
                .transactionHash
            : zeroHash;

          txModalStages.success(balance, txHash);
          return true;
        }

        //
        // Legacy flow
        //

        let txHash: Hash | undefined = undefined;

        if (isL2) {
          // The operation 'stETH to wstETH' on L2 is 'unwrap'
          await l2.unwrapStethToWsteth({
            value: amount,
            callback: async ({ stage, payload }) => {
              switch (stage) {
                case TransactionCallbackStage.SIGN:
                  txModalStages.sign(amount, token, willReceive);
                  break;
                case TransactionCallbackStage.RECEIPT:
                  txModalStages.pending(amount, token, willReceive, payload);
                  // the payload here is txHash
                  txHash = payload;
                  break;
                case TransactionCallbackStage.DONE: {
                  const [, balance] = await Promise.all([
                    onConfirm?.(),
                    isL2 ? l2.wsteth.balance(address) : wstETH.balance(address),
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

          return true;
        }

        if (token === TOKENS_TO_WRAP.stETH) {
          if (isAA) {
            const wrapContract = await wrap.getContractWstETH();
            const stethContract = await stETH.getContract();

            const calls: unknown[] = [];

            if (isApprovalNeededBeforeWrapOnL1) {
              calls.push({
                to: stethContract.address,
                abi: stethContract.abi,
                functionName: 'approve',
                args: [wrapContract.address, amount] as const,
              });
            }
            calls.push({
              to: wrapContract.address,
              abi: wrapContract.abi,
              functionName: 'wrap',
              args: [amount] as const,
            });
            txModalStages.sign(amount, token, willReceive);
            const callStatus = await sendAACalls(calls, (props) => {
              if (props.stage === 'sent')
                txModalStages.pending(
                  amount,
                  token,
                  willReceive,
                  props.callId as Hash,
                );
            });

            const [, balance] = await Promise.all([
              onConfirm?.(),
              isL2 ? l2.wsteth.balance(address) : wstETH.balance(address),
            ]);
            const txHash = callStatus.receipts
              ? callStatus.receipts[callStatus.receipts.length - 1]
                  .transactionHash
              : zeroHash;
            txModalStages.success(balance, txHash);
            return true;
          }

          if (isApprovalNeededBeforeWrapOnL1) {
            await processApproveTxOnL1({ onRetry });
          }

          await wrap.wrapSteth({
            value: amount,
            callback: async ({ stage, payload }) => {
              switch (stage) {
                case TransactionCallbackStage.SIGN:
                  txModalStages.sign(amount, token, willReceive);
                  break;
                case TransactionCallbackStage.RECEIPT:
                  // the payload here is txHash
                  txHash = payload;
                  txModalStages.pending(amount, token, willReceive, txHash);
                  break;
                case TransactionCallbackStage.DONE: {
                  const [, balance] = await Promise.all([
                    onConfirm?.(),
                    isL2 ? l2.wsteth.balance(address) : wstETH.balance(address),
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
          if (
            config.enableQaHelpers &&
            window.localStorage.getItem('mockLimitReached') === 'true'
          ) {
            throw new MockLimitReachedError('Stake limit reached');
          }

          await wrap.wrapEth({
            value: amount,
            callback: async ({ stage, payload }) => {
              switch (stage) {
                case TransactionCallbackStage.SIGN:
                  txModalStages.sign(amount, token, willReceive);
                  break;
                case TransactionCallbackStage.RECEIPT:
                  txModalStages.pending(amount, token, willReceive, payload);
                  // the payload here is txHash
                  txHash = payload;
                  break;
                case TransactionCallbackStage.DONE: {
                  const [, balance] = await Promise.all([
                    onConfirm?.(),
                    isL2 ? l2.wsteth.balance(address) : wstETH.balance(address),
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
            account: address,
          });
        }

        return true;
      } catch (error) {
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
      txModalStages,
      onRetry,
      onConfirm,
      wstETH,
      isAA,
      isApprovalNeededBeforeWrapOnL1,
      stETH,
      sendAACalls,
      processApproveTxOnL1,
    ],
  );
};
