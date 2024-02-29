import invariant from 'tiny-invariant';

import { useCallback } from 'react';
import { useSDK } from '@lido-sdk/react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useWrapTxProcessing } from './use-wrap-tx-processing';
import { useTxModalWrap } from './use-tx-modal-stages-wrap';
import { useWSTETHContractRPC } from '@lido-sdk/react';

import { runWithTransactionLogger } from 'utils';
import { isContract } from 'utils/isContract';
import type {
  WrapFormApprovalData,
  WrapFormInputType,
} from '../wrap-form-context';

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
  const { account } = useWeb3();
  const { providerWeb3 } = useSDK();
  const processWrapTx = useWrapTxProcessing();
  const { isApprovalNeededBeforeWrap, processApproveTx } = approvalData;
  const { createTxModalSession } = useTxModalWrap();
  const wstETHContractRPC = useWSTETHContractRPC();

  return useCallback(
    async ({ amount, token }: WrapFormInputType) => {
      invariant(amount, 'amount should be presented');
      invariant(account, 'address should be presented');
      invariant(providerWeb3, 'provider should be presented');
      const isMultisig = await isContract(account, providerWeb3);
      const willReceive = await wstETHContractRPC.getWstETHByStETH(amount);

      const txModalStages = createTxModalSession();

      try {
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

        const wstethBalance = await wstETHContractRPC.balanceOf(account);

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
      account,
      providerWeb3,
      wstETHContractRPC,
      isApprovalNeededBeforeWrap,
      createTxModalSession,
      onConfirm,
      processApproveTx,
      processWrapTx,
      onRetry,
    ],
  );
};
