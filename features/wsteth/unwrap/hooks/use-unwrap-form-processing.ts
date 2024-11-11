/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useCallback } from 'react';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';

import {
  useSDK,
  useWSTETHContractRPC,
  useWSTETHContractWeb3,
} from '@lido-sdk/react';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import {
  useTxConfirmation,
  sendTx,
  useLidoSDK,
  useDappStatus,
  useGetIsContract,
} from 'modules/web3';
import { runWithTransactionLogger } from 'utils';

import { convertToBigNumber } from 'utils/convert-to-big-number';

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
  const { isDappActiveOnL2, address } = useDappStatus();
  const { providerWeb3 } = useSDK();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const { txModalStages } = useTxModalStagesUnwrap();
  const wstETHContractRPC = useWSTETHContractRPC();
  const wstethContractWeb3 = useWSTETHContractWeb3();
  const waitForTx = useTxConfirmation();
  const isContract = useGetIsContract();
  const { l2, stETH, isL2 } = useLidoSDK();

  const {
    isApprovalNeededBeforeUnwrap: isApprovalNeededBeforeUnwrapOnL2,
    processApproveTx: processApproveTxOnL2,
  } = approvalDataOnL2;

  return useCallback(
    async ({ amount }: UnwrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');
        if (!isL2) {
          invariant(providerWeb3, 'providerWeb3 must be presented');
          invariant(wstethContractWeb3, 'must have wstethContractWeb3');
        }

        const [isMultisig, willReceive] = await Promise.all([
          isContract(address),
          isL2
            ? l2.steth
                .convertToSteth(amount.toBigInt())
                .then(convertToBigNumber)
            : wstETHContractRPC.getStETHByWstETH(amount),
        ]);

        if (isL2 && isApprovalNeededBeforeUnwrapOnL2) {
          txModalStages.signApproval(amount);

          await processApproveTxOnL2({
            onTxSent: (txHash) => {
              if (!isMultisig) {
                txModalStages.pendingApproval(amount, txHash);
              }
            },
          });

          if (isMultisig) {
            txModalStages.successMultisig();
            return true;
          }
        }

        txModalStages.sign(amount, willReceive);

        let txHash: string;
        if (isL2) {
          txHash = (
            await runWithTransactionLogger('Unwrap signing on L2', () =>
              // The operation 'wstETH to stETH' on L2 is 'wrap'
              l2.wrapWstethToSteth({
                value: amount.toBigInt(),
                callback: ({ stage, payload }) => {
                  if (stage === TransactionCallbackStage.RECEIPT)
                    txModalStages.pending(amount, willReceive, payload);
                },
              }),
            )
          ).hash;
        } else {
          txHash = await runWithTransactionLogger(
            'Unwrap signing on L1',
            async () => {
              const tx =
                await wstethContractWeb3!.populateTransaction.unwrap(amount);

              return sendTx({
                tx,
                isMultisig,
                staticProvider: staticRpcProvider,
                walletProvider: providerWeb3!,
              });
            },
          );
          if (!isMultisig) txModalStages.pending(amount, willReceive, txHash);
        }

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        await runWithTransactionLogger('Unwrap block confirmation', () =>
          waitForTx(txHash),
        );

        const [stethBalance] = await Promise.all([
          isDappActiveOnL2 ? l2.steth.balance(address) : stETH.balance(address),
          onConfirm(),
        ]);

        txModalStages.success(BigNumber.from(stethBalance), txHash);
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
      isContract,
      l2,
      wstETHContractRPC,
      isApprovalNeededBeforeUnwrapOnL2,
      txModalStages,
      isDappActiveOnL2,
      stETH,
      onConfirm,
      providerWeb3,
      wstethContractWeb3,
      processApproveTxOnL2,
      staticRpcProvider,
      waitForTx,
      onRetry,
    ],
  );
};
