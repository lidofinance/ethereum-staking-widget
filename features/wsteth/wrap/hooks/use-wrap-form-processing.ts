import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';

import { useSDK } from '@lido-sdk/react';
import { useWSTETHContractRPC } from '@lido-sdk/react';

import { runWithTransactionLogger } from 'utils';
import { isContract } from 'utils/isContract';
import type {
  WrapFormApprovalData,
  WrapFormInputType,
} from '../wrap-form-context';

import { useWrapTxProcessing } from './use-wrap-tx-processing';
import { useTxModalWrap } from './use-tx-modal-stages-wrap';

type UseWrapFormProcessorArgs = {
  approvalData: WrapFormApprovalData;
  onConfirm?: () => Promise<void>;
  onRetry?: () => void;
};

export const useWrapFormProcessor = ({
  approvalData,
  onConfirm,
  onRetry,
}: UseWrapFormProcessorArgs) => {
  const { address } = useAccount();
  const { providerWeb3 } = useSDK();
  const processWrapTx = useWrapTxProcessing();
  const { isApprovalNeededBeforeWrap, processApproveTx } = approvalData;
  const { txModalStages } = useTxModalWrap();
  const wstETHContractRPC = useWSTETHContractRPC();

  return useCallback(
    async ({ amount, token }: WrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');
        invariant(providerWeb3, 'provider should be presented');
        const isMultisig = await isContract(address, providerWeb3);
        const willReceive = await wstETHContractRPC.getWstETHByStETH(amount);

        if (isApprovalNeededBeforeWrap) {
          txModalStages.signApproval(amount, token);

          await processApproveTx({
            onTxSent: (tx) => {
              const txHash = typeof tx === 'string' ? tx : tx.hash;
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

        const tx = await runWithTransactionLogger('Wrap signing', () =>
          processWrapTx({ amount, token, isMultisig }),
        );
        const txHash = typeof tx === 'string' ? tx : tx.hash;

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(amount, token, willReceive, txHash);

        if (typeof tx === 'object') {
          await runWithTransactionLogger('Wrap block confirmation', async () =>
            tx.wait(),
          );
        }

        const wstethBalance = await wstETHContractRPC.balanceOf(address);

        await onConfirm?.();
        txModalStages.success(wstethBalance, txHash);
        return true;
      } catch (error) {
        console.warn(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      address,
      providerWeb3,
      wstETHContractRPC,
      isApprovalNeededBeforeWrap,
      txModalStages,
      onConfirm,
      processApproveTx,
      processWrapTx,
      onRetry,
    ],
  );
};
