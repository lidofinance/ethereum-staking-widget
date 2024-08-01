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
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';

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
  const { txModalStages } = useTxModalWrap();
  const wstETHContractRPC = useWSTETHContractRPC();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();

  return useCallback(
    async ({ amount, token }: WrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(account, 'address should be presented');
        invariant(providerWeb3, 'provider should be presented');
        const isMultisig = await isContract(account, providerWeb3);
        const willReceive = await wstETHContractRPC.getWstETHByStETH(amount);

        if (isApprovalNeededBeforeWrap) {
          txModalStages.signApproval(amount, token);

          await processApproveTx({
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

        const txHash = await runWithTransactionLogger('Wrap signing', () =>
          processWrapTx({ amount, token, isMultisig }),
        );

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(amount, token, willReceive, txHash);

        await runWithTransactionLogger('Wrap block confirmation', () =>
          staticRpcProvider.waitForTransaction(txHash),
        );

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
      txModalStages,
      onConfirm,
      processApproveTx,
      processWrapTx,
      staticRpcProvider,
      onRetry,
    ],
  );
};
