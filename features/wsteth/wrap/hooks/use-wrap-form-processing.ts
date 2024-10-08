import { useCallback } from 'react';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';

import { useSDK, useWSTETHContractRPC } from '@lido-sdk/react';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';

import { useTxConfirmation } from 'shared/hooks/use-tx-conformation';
import { useGetIsContract } from 'shared/hooks/use-is-contract';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { runWithTransactionLogger } from 'utils';
import { convertToBigNumber } from 'utils/convert-to-big-number';

import { useLidoSDK } from 'providers/lido-sdk';

import type {
  WrapFormApprovalData,
  WrapFormInputType,
} from '../wrap-form-context';
import { useWrapTxOnL1Processing } from './use-wrap-tx-on-l1-processing';
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
  const { address } = useAccount();
  const { providerWeb3 } = useSDK();
  const wstETHContractRPC = useWSTETHContractRPC();
  const { l2, isL2, wstETH } = useLidoSDK();

  const { isAccountActiveOnL2 } = useDappStatus();

  const { txModalStages } = useTxModalWrap();
  const processWrapTxOnL1 = useWrapTxOnL1Processing();

  const waitForTx = useTxConfirmation();
  const isContract = useGetIsContract();
  const {
    isApprovalNeededBeforeWrap: isApprovalNeededBeforeWrapOnL1,
    processApproveTx: processApproveTxOnL1,
  } = approvalDataOnL1;

  return useCallback(
    async ({ amount, token }: WrapFormInputType) => {
      try {
        if (!isL2) {
          invariant(providerWeb3, 'providerWeb3 should be presented');
        }
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');

        const [isMultisig, willReceive] = await Promise.all([
          isContract(address),
          isAccountActiveOnL2
            ? l2.steth
                .convertToShares(amount.toBigInt())
                .then(convertToBigNumber)
            : wstETHContractRPC.getWstETHByStETH(amount),
        ]);

        if (isApprovalNeededBeforeWrapOnL1) {
          txModalStages.signApproval(amount, token);

          await processApproveTxOnL1({
            onTxSent: (txHash) => {
              if (!isMultisig) {
                txModalStages.pendingApproval(amount, token, txHash);
              }
            },
          });
          if (isMultisig) {
            txModalStages.successMultisig();
            return true;
          }
        }

        txModalStages.sign(amount, token, willReceive);

        let txHash: string;
        if (isAccountActiveOnL2) {
          const txResult = await runWithTransactionLogger(
            'Wrap signing on L2',
            () =>
              // The operation 'stETH to wstETH' on L2 is 'unwrap'
              l2.unwrapStethToWsteth({
                value: amount.toBigInt(),
                callback: ({ stage, payload }) => {
                  if (stage === TransactionCallbackStage.RECEIPT)
                    txModalStages.pending(amount, token, willReceive, payload);
                },
              }),
          );
          txHash = txResult.hash;
        } else {
          txHash = await runWithTransactionLogger('Wrap signing on L1', () =>
            processWrapTxOnL1({ amount, token, isMultisig }),
          );
          if (!isMultisig)
            txModalStages.pending(amount, token, willReceive, txHash);
        }

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        await runWithTransactionLogger('Wrap block confirmation', () =>
          waitForTx(txHash),
        );

        const [wstethBalance] = await Promise.all([
          isAccountActiveOnL2
            ? l2.wsteth.balance(address)
            : wstETH.balance(address),
          onConfirm(),
        ]);

        txModalStages.success(BigNumber.from(wstethBalance), txHash);
        return true;
      } catch (error) {
        console.warn(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      isL2,
      address,
      isContract,
      isAccountActiveOnL2,
      l2,
      wstETHContractRPC,
      isApprovalNeededBeforeWrapOnL1,
      txModalStages,
      wstETH,
      onConfirm,
      providerWeb3,
      processApproveTxOnL1,
      processWrapTxOnL1,
      waitForTx,
      onRetry,
    ],
  );
};
