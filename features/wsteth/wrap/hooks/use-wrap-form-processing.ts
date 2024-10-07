import { useCallback } from 'react';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';

import { useSDK, useWSTETHContractRPC } from '@lido-sdk/react';

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
  const { address } = useAccount();
  const { providerWeb3 } = useSDK();
  const wstETHContractRPC = useWSTETHContractRPC();
  const { l2: lidoSDKL2, wstETH: lidoSDKwstETH } = useLidoSDK();

  const { isAccountActiveOnL2 } = useDappStatus();

  const { txModalStages } = useTxModalWrap();
  const processWrapTxOnL1 = useWrapTxOnL1Processing();
  const processWrapTxOnL2 = useWrapTxOnL2Processing();

  const waitForTx = useTxConfirmation();
  const isContract = useGetIsContract();
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
          isContract(address),
          isAccountActiveOnL2
            ? lidoSDKL2.steth.convertToShares(amount.toBigInt())
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

        txModalStages.sign(amount, token, convertToBigNumber(willReceive));

        let txHash: string;
        if (isAccountActiveOnL2) {
          const txResult = await runWithTransactionLogger(
            'Wrap signing on L2',
            () => processWrapTxOnL2({ amount }),
          );
          txHash = txResult.hash;
        } else {
          txHash = await runWithTransactionLogger('Wrap signing on L1', () =>
            processWrapTxOnL1({ amount, token, isMultisig }),
          );
        }

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(
          amount,
          token,
          convertToBigNumber(willReceive),
          txHash,
        );

        await runWithTransactionLogger('Wrap block confirmation', () =>
          waitForTx(txHash),
        );

        const [wstethBalance] = await Promise.all([
          isAccountActiveOnL2
            ? lidoSDKL2.wsteth.balance(address)
            : lidoSDKwstETH.balance(address),
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
      address,
      providerWeb3,
      isContract,
      isAccountActiveOnL2,
      lidoSDKL2.steth,
      lidoSDKL2.wsteth,
      wstETHContractRPC,
      isApprovalNeededBeforeWrapOnL1,
      txModalStages,
      lidoSDKwstETH,
      onConfirm,
      processApproveTxOnL1,
      processWrapTxOnL2,
      processWrapTxOnL1,
      waitForTx,
      onRetry,
    ],
  );
};
