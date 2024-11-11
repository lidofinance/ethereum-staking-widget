import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

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
  const { l2, shares, wrap, wstETH } = useLidoSDK();
  const { txModalStages } = useTxModalWrap();

  const {
    isApprovalNeededBeforeWrap: isApprovalNeededBeforeWrapOnL1,
    processApproveTx: processApproveTxOnL1,
  } = approvalDataOnL1;

  const showSuccessTxModal = useCallback(
    async (txHash: `0x${string}`) => {
      const wstethBalance = await (isDappActiveOnL2
        ? l2.wsteth.balance(address)
        : wstETH.balance(address));
      txModalStages.success(wstethBalance, txHash);
    },
    [address, isDappActiveOnL2, l2.wsteth, txModalStages, wstETH],
  );

  return useCallback(
    async ({ amount, token }: WrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');

        const willReceive = await (isDappActiveOnL2
          ? l2.steth.convertToShares(amount)
          : shares.convertToShares(amount));

        if (isDappActiveOnL2) {
          // The operation 'stETH to wstETH' on L2 is 'unwrap'
          await l2.unwrapStethToWsteth({
            value: amount,
            callback: ({ stage, payload }) => {
              switch (stage) {
                case TransactionCallbackStage.SIGN:
                  txModalStages.sign(amount, token, willReceive);
                  break;
                case TransactionCallbackStage.RECEIPT:
                  txModalStages.pending(amount, token, willReceive, payload);
                  break;
                case TransactionCallbackStage.CONFIRMATION:
                  void onConfirm?.();
                  void showSuccessTxModal(payload?.transactionHash);
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

        if (token === TOKENS_TO_WRAP.STETH) {
          if (isApprovalNeededBeforeWrapOnL1) {
            await processApproveTxOnL1({ onRetry });
          }

          await wrap.wrapSteth({
            value: amount,
            callback: ({ stage, payload }) => {
              switch (stage) {
                case TransactionCallbackStage.SIGN:
                  txModalStages.sign(amount, token, willReceive);
                  break;
                case TransactionCallbackStage.RECEIPT:
                  txModalStages.pending(amount, token, willReceive, payload);
                  break;
                case TransactionCallbackStage.CONFIRMATION:
                  void onConfirm?.();
                  void showSuccessTxModal(payload?.transactionHash);
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
          // TODO: NEW SDK (add mockLimitReached)

          await wrap.wrapEth({
            value: amount,
            callback: ({ stage, payload }) => {
              switch (stage) {
                case TransactionCallbackStage.SIGN:
                  txModalStages.sign(amount, token, willReceive);
                  break;
                case TransactionCallbackStage.RECEIPT:
                  txModalStages.pending(amount, token, willReceive, payload);
                  break;
                case TransactionCallbackStage.CONFIRMATION:
                  void onConfirm?.();
                  void showSuccessTxModal(payload?.transactionHash);
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
      shares,
      txModalStages,
      onConfirm,
      showSuccessTxModal,
      onRetry,
      isApprovalNeededBeforeWrapOnL1,
      wrap,
      processApproveTxOnL1,
    ],
  );
};
