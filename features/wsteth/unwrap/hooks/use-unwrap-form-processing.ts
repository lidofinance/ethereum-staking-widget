import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';

import { useSTETHContractRPC, useWSTETHContractRPC } from '@lido-sdk/react';

import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { isContract } from 'utils/isContract';
import { runWithTransactionLogger } from 'utils';

import type { UnwrapFormInputType } from '../unwrap-form-context';
import { useUnwrapTxProcessing } from './use-unwrap-tx-processing';
import { useTxModalStagesUnwrap } from './use-tx-modal-stages-unwrap';

type UseUnwrapFormProcessorArgs = {
  onConfirm?: () => Promise<void>;
  onRetry?: () => void;
};

export const useUnwrapFormProcessor = ({
  onConfirm,
  onRetry,
}: UseUnwrapFormProcessorArgs) => {
  const { address } = useAccount();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const processWrapTx = useUnwrapTxProcessing();
  const stETHContractRPC = useSTETHContractRPC();
  const wstETHContractRPC = useWSTETHContractRPC();
  const { txModalStages } = useTxModalStagesUnwrap();

  return useCallback(
    async ({ amount }: UnwrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');
        const isMultisig = await isContract(account, staticRpcProvider);
        const willReceive = await wstETHContractRPC.getStETHByWstETH(amount);

        txModalStages.sign(amount, willReceive);

        const txHash = await runWithTransactionLogger('Unwrap signing', () =>
          processWrapTx({ amount, isMultisig }),
        );

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(amount, willReceive, txHash);

        await runWithTransactionLogger('Unwrap block confirmation', async () =>
          staticRpcProvider.waitForTransaction(txHash),
        );

        const stethBalance = await stETHContractRPC.balanceOf(address);

        await onConfirm?.();
        txModalStages.success(stethBalance, txHash);
        return true;
      } catch (error: any) {
        console.warn(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      address,
      wstETHContractRPC,
      txModalStages,
      stETHContractRPC,
      onConfirm,
      processWrapTx,
      staticRpcProvider,
      onRetry,
    ],
  );
};
