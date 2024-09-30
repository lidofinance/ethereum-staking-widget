import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';

import { useSDK, useWSTETHContractRPC } from '@lido-sdk/react';

import { CHAINS, isSDKSupportedL2Chain } from 'consts/chains';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { useTxConfirmation } from 'shared/hooks/use-tx-conformation';
import { runWithTransactionLogger } from 'utils';
import { isContract } from 'utils/isContract';

import type {
  WrapFormApprovalData,
  WrapFormInputType,
} from '../wrap-form-context';
import { useWrapTxOnL1Processing } from './use-wrap-tx-on-l1-processing';
import { useWrapTxOnL2Processing } from './use-wrap-tx-on-l2-processing';
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
  const { address, chainId } = useAccount();
  const { providerWeb3 } = useSDK();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const wstETHContractRPC = useWSTETHContractRPC();

  const { txModalStages } = useTxModalWrap();
  const processWrapTxOnL1 = useWrapTxOnL1Processing();
  const processWrapTxOnL2 = useWrapTxOnL2Processing();

  const waitForTx = useTxConfirmation();
  const {
    isApprovalNeededBeforeWrap: isApprovalNeededBeforeWrapOnL1,
    processApproveTx: processApproveTxOnL1,
  } = approvalDataOnL1;

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

        let txHash;
        if (isSDKSupportedL2Chain(chainId as CHAINS)) {
          txHash = (await processWrapTxOnL2({ amount })).hash;
        } else {
          txHash = await runWithTransactionLogger('Wrap signing', () =>
            processWrapTxOnL1({ amount, token, isMultisig }),
          );
        }

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
      isApprovalNeededBeforeWrapOnL1,
      txModalStages,
      chainId,
      onConfirm,
      processApproveTxOnL1,
      processWrapTxOnL2,
      processWrapTxOnL1,
      waitForTx,
      onRetry,
    ],
  );
};
