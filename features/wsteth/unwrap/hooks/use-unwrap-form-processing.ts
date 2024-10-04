import { useCallback } from 'react';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';

import {
  useSDK,
  useWSTETHContractRPC,
  useWSTETHContractWeb3,
} from '@lido-sdk/react';

import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { useTxConfirmation } from 'shared/hooks/use-tx-conformation';
import { isContract } from 'utils/isContract';
import { runWithTransactionLogger } from 'utils';
import { sendTx } from 'utils/send-tx';
import { useLidoSDK } from 'providers/lido-sdk';

import { useDappStatus } from '../../../../shared/hooks/use-dapp-status';
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
  const { address } = useAccount();
  const { providerWeb3 } = useSDK();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const { txModalStages } = useTxModalStagesUnwrap();
  const wstETHContractRPC = useWSTETHContractRPC();
  const wstethContractWeb3 = useWSTETHContractWeb3();
  const waitForTx = useTxConfirmation();
  const { l2: lidoSDKL2, stETH: lidoSDKstETH } = useLidoSDK();
  const { isAccountActiveOnL2 } = useDappStatus();

  const {
    isApprovalNeededBeforeUnwrap: isApprovalNeededBeforeUnwrapOnL2,
    processApproveTx: processApproveTxOnL2,
  } = approvalDataOnL2;

  return useCallback(
    async ({ amount }: UnwrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');
        invariant(providerWeb3, 'providerWeb3 must be presented');
        invariant(wstethContractWeb3, 'must have wstethContractWeb3');

        const [isMultisig, willReceive] = await Promise.all([
          isContract(address, staticRpcProvider),
          wstETHContractRPC.getStETHByWstETH(amount),
        ]);

        if (isApprovalNeededBeforeUnwrapOnL2) {
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
        if (isAccountActiveOnL2) {
          txHash = (
            await runWithTransactionLogger('Unwrap signing on L2', () =>
              // The operation 'wstETH to stETH' on L2 is 'wrap'
              lidoSDKL2.wrapWstethToSteth({
                value: amount.toBigInt(),
              }),
            )
          ).hash;
        } else {
          txHash = await runWithTransactionLogger(
            'Unwrap signing on L1',
            async () => {
              const tx =
                await wstethContractWeb3.populateTransaction.unwrap(amount);

              return sendTx({
                tx,
                isMultisig,
                staticProvider: staticRpcProvider,
                walletProvider: providerWeb3,
              });
            },
          );
        }

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(amount, willReceive, txHash);

        await runWithTransactionLogger('Unwrap block confirmation', () =>
          waitForTx(txHash),
        );

        const [stethBalance] = await Promise.all([
          isAccountActiveOnL2
            ? lidoSDKL2.steth.balance(address)
            : lidoSDKstETH.balance(address),
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
      providerWeb3,
      wstethContractWeb3,
      staticRpcProvider,
      wstETHContractRPC,
      isApprovalNeededBeforeUnwrapOnL2,
      txModalStages,
      isAccountActiveOnL2,
      lidoSDKL2,
      lidoSDKstETH,
      onConfirm,
      processApproveTxOnL2,
      waitForTx,
      onRetry,
    ],
  );
};
