import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import {
  LIDO_TOKENS,
  type PopulatedTransaction,
} from '@lidofinance/lido-ethereum-sdk/core';

import { config } from 'config';
import { MockLimitReachedError } from 'features/stake/stake-form/utils';
import {
  applyRoundUpGasLimit,
  useDappStatus,
  useLidoSDK,
  useLidoSDKL2,
  useTxFlow,
  useAA,
} from 'modules/web3';
import { getReferralAddress } from 'utils/get-referral-address';

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
  const { wrap, wstETH } = useLidoSDK();
  const { isAA } = useAA();
  const { l2, isL2 } = useLidoSDKL2();
  const { txModalStages } = useTxModalWrap();
  const txFlow = useTxFlow();

  const {
    needsApprove: needsApproveL1,
    processApproveTx: processApproveTxOnL1,
  } = approvalDataOnL1;

  return useCallback(
    async ({ amount, token, referral }: WrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');

        const referralAddress = await getReferralAddress(
          referral,
          wrap.core.rpcProvider,
        );

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

        await txFlow({
          callsFn: async () => {
            let calls = [];
            const args = {
              value: amount,
            };
            if (isL2) {
              // unwrap steth to wsteth on l2
              calls = [await l2.unwrapStethPopulateTx(args)];
            } else if (token === TOKENS_TO_WRAP.stETH) {
              // optional approve + wrap steth to wsteth
              calls = await Promise.all([
                needsApproveL1 &&
                  // fix for sdk mistype
                  (wrap.approveStethForWrapPopulateTx(
                    args,
                  ) as Promise<PopulatedTransaction>),
                wrap.wrapStethPopulateTx(args),
              ]);
            } else {
              // wrap eth to wsteth
              calls = [
                await wrap.wrapEthPopulateTx({
                  value: args.value,
                  referralAddress,
                }),
              ];
            }
            return calls;
          },
          sendTransaction: async (txStagesCallback) => {
            if (isL2) {
              // 1. The operation 'stETH to wstETH' on L2 is 'unwrap'
              // 2. Intentionally using void here instead of await
              //    because awaiting causes an "Internal JSON-RPC error" for some reason.
              //    TODO: investigate this issue.
              void l2.unwrapStethToWsteth({
                value: amount,
                callback: txStagesCallback,
              });
              return;
            }

            if (token === TOKENS_TO_WRAP.stETH) {
              if (needsApproveL1) {
                await processApproveTxOnL1({ onRetry });
              }

              await wrap.wrapSteth({
                value: amount,
                callback: txStagesCallback,
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
                referralAddress,
                callback: txStagesCallback,
              });
            }
          },
          onSign: async ({ payload }) => {
            txModalStages.sign(amount, token, willReceive);
            if (token === LIDO_TOKENS.eth) {
              return applyRoundUpGasLimit(
                (payload as bigint) ?? config.WRAP_ETH_GASLIMIT_FALLBACK,
              );
            }
          },
          onReceipt: ({ txHashOrCallId }) => {
            txModalStages.pending(
              amount,
              token,
              willReceive,
              txHashOrCallId,
              isAA,
            );
          },
          onSuccess: async ({ txHash }) => {
            const balance = await onWrapConfirm();
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
      txFlow,
      onConfirm,
      wstETH,
      needsApproveL1,
      processApproveTxOnL1,
      onRetry,
      txModalStages,
      isAA,
    ],
  );
};
