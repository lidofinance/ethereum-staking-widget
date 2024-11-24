import type { Address } from 'viem';
import { useCallback, useRef } from 'react';
import invariant from 'tiny-invariant';

import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import { config } from 'config';
import { MockLimitReachedError } from 'features/stake/stake-form/utils';
import { useDappStatus, useLidoSDK } from 'modules/web3';

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
  const { isDappActiveOnL2, address } = useDappStatus();
  const { l2, wrap, wstETH } = useLidoSDK();
  const { txModalStages } = useTxModalWrap();
  // Using useRef here instead of useState to store txHash because useRef updates immediately
  // without triggering a rerender. Also, the React 18 also has issues with asynchronous state updates.
  const txHashRef = useRef<Address | undefined>(undefined);

  const {
    isApprovalNeededBeforeWrap: isApprovalNeededBeforeWrapOnL1,
    processApproveTx: processApproveTxOnL1,
  } = approvalDataOnL1;

  return useCallback(
    async ({ amount, token }: WrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');

        const willReceive = await (isDappActiveOnL2
          ? l2.steth.convertToShares(amount)
          : wrap.convertStethToWsteth(amount));

        if (isDappActiveOnL2) {
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
                  txHashRef.current = payload;
                  break;
                case TransactionCallbackStage.DONE:
                  await onConfirm?.();
                  txModalStages.success(
                    await (isDappActiveOnL2
                      ? l2.wsteth.balance(address)
                      : wstETH.balance(address)),
                    txHashRef.current,
                  );
                  break;
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
                  txModalStages.pending(amount, token, willReceive, payload);
                  // the payload here is txHash
                  txHashRef.current = payload;
                  break;
                case TransactionCallbackStage.DONE:
                  await onConfirm?.();
                  txModalStages.success(
                    await (isDappActiveOnL2
                      ? l2.wsteth.balance(address)
                      : wstETH.balance(address)),
                    txHashRef.current,
                  );
                  break;
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
                  txHashRef.current = payload;
                  break;
                case TransactionCallbackStage.DONE:
                  await onConfirm?.();
                  txModalStages.success(
                    await (isDappActiveOnL2
                      ? l2.wsteth.balance(address)
                      : wstETH.balance(address)),
                    txHashRef.current,
                  );
                  break;
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
      isDappActiveOnL2,
      l2,
      wrap,
      txModalStages,
      onConfirm,
      wstETH,
      onRetry,
      isApprovalNeededBeforeWrapOnL1,
      processApproveTxOnL1,
    ],
  );
};
