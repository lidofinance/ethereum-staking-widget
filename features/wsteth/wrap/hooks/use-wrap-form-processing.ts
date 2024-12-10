import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import {
  TransactionCallback,
  TransactionCallbackStage,
} from '@lidofinance/lido-ethereum-sdk/core';

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

import type { Hash } from 'viem';

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

        const onWrapConfirm = async () => {
          const [, balance] = await Promise.all([
            onConfirm?.(),
            isL2 ? l2.wsteth.balance(address) : wstETH.balance(address),
          ]);
          return balance;
        };

        //
        // ERC5792 flow
        //
        if (isAA) {
          const calls: unknown[] = [];
          // unwrap steth to wsteth on l2
          if (isL2) {
            const { to, data } = await l2.unwrapStethPopulateTx({
              value: amount,
            });
            calls.push({
              to,
              data,
            });
            // wrap steth to wsteth
          } else if (token === TOKENS_TO_WRAP.stETH) {
            const wrapCall = await wrap.wrapStethPopulateTx({ value: amount });

            if (isApprovalNeededBeforeWrapOnL1) {
              const { to, data } = await stETH.populateApprove({
                amount,
                to: wrapCall.to,
              });
              calls.push({
                to,
                data,
              });
            }
            calls.push({
              to: wrapCall.to,
              data: wrapCall.data,
            });
            // wrap eth to wsteth
          } else {
            const { to, data, value } = await wrap.wrapEthPopulateTx({
              value: amount,
            });
            calls.push({
              to,
              data,
              value,
            });
          }

          await sendAACalls(calls, async (props) => {
            switch (props.stage) {
              case TransactionCallbackStage.SIGN:
                txModalStages.sign(amount, token, willReceive);
                break;
              case TransactionCallbackStage.RECEIPT:
                txModalStages.pending(
                  amount,
                  token,
                  willReceive,
                  props.callId as Hash,
                  isAA,
                );
                break;
              case TransactionCallbackStage.DONE: {
                const balance = await onWrapConfirm();
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

        //
        // Legacy flow
        //

        let txHash: Hash | undefined = undefined;

        const callback: TransactionCallback = async ({ stage, payload }) => {
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
              const balance = await onWrapConfirm();
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
          // The operation 'stETH to wstETH' on L2 is 'unwrap'
          await l2.unwrapStethToWsteth({
            value: amount,
            callback,
          });

          return true;
        }

        if (token === TOKENS_TO_WRAP.stETH) {
          if (isApprovalNeededBeforeWrapOnL1) {
            await processApproveTxOnL1({ onRetry });
          }

          await wrap.wrapSteth({
            value: amount,
            callback,
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
            callback,
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
