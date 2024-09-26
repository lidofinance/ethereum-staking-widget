import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';

import { useSDK, useWSTETHContractRPC } from '@lido-sdk/react';

import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { runWithTransactionLogger } from 'utils';
import { isContract } from 'utils/isContract';
import { useTxConfirmation } from 'shared/hooks/use-tx-conformation';

import type {
  WrapFormApprovalData,
  WrapFormInputType,
} from '../wrap-form-context';
// import { useWrapTxProcessing } from './use-wrap-tx-processing';
import { useTxModalWrap } from './use-tx-modal-stages-wrap';
import { useLidoSDK } from '../../../../providers/lido-sdk';

type UseWrapFormProcessorArgs = {
  approvalData: WrapFormApprovalData;
  onConfirm: () => Promise<void>;
  onRetry?: () => void;
};

export const useWrapFormProcessor = ({
  approvalData,
  onConfirm,
  onRetry,
}: UseWrapFormProcessorArgs) => {
  const { address } = useAccount();
  const { providerWeb3 } = useSDK();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const wstETHContractRPC = useWSTETHContractRPC();

  const { txModalStages } = useTxModalWrap();
  // const processWrapTx = useWrapTxProcessing();

  const { l2 } = useLidoSDK();

  const waitForTx = useTxConfirmation();
  const { isApprovalNeededBeforeWrap, processApproveTx } = approvalData;

  return useCallback(
    async ({ amount, token }: WrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');
        invariant(providerWeb3, 'providerWeb3 should be presented');

        const [isMultisig, willReceive] = await Promise.all([
          isContract(address, staticRpcProvider),
          wstETHContractRPC.getWstETHByStETH(amount),
        ]);

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

        // console.log('address:', address);
        // console.log('amount:', amount);
        // console.log('amount.toString():', amount.toString());

        const tx = await l2.unwrap({
          // account: address,
          // value: amount,
          value: parseEther('0.0001'),
        });
        // console.log('tx:', tx);
        const txHash = tx.hash;
        // console.log('txHash:', txHash);

        // const txHash = await runWithTransactionLogger('Wrap signing', () =>
        //   processWrapTx({ amount, token, isMultisig }),
        // );

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(amount, token, willReceive, txHash);

        await runWithTransactionLogger('Wrap block confirmation', () =>
          waitForTx(txHash),
        );

        const [wstethBalance] = await Promise.all([
          wstETHContractRPC.balanceOf(address),
          onConfirm(),
        ]);

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
      staticRpcProvider,
      wstETHContractRPC,
      isApprovalNeededBeforeWrap,
      txModalStages,
      l2,
      onConfirm,
      processApproveTx,
      waitForTx,
      onRetry,
    ],
  );
};
