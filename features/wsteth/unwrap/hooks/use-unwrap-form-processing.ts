import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';

import {
  useSDK,
  useSTETHContractRPC,
  useWSTETHContractRPC,
} from '@lido-sdk/react';

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
  const { providerWeb3 } = useSDK();
  const processWrapTx = useUnwrapTxProcessing();
  const stETHContractRPC = useSTETHContractRPC();
  const wstETHContractRPC = useWSTETHContractRPC();
  const { txModalStages } = useTxModalStagesUnwrap();

  return useCallback(
    async ({ amount }: UnwrapFormInputType) => {
      try {
        invariant(amount, 'amount should be presented');
        invariant(address, 'address should be presented');
        invariant(providerWeb3, 'provider should be presented');
        const isMultisig = await isContract(address, providerWeb3);
        const willReceive = await wstETHContractRPC.getStETHByWstETH(amount);

        txModalStages.sign(amount, willReceive);

        const tx = await runWithTransactionLogger('Unwrap signing', () =>
          processWrapTx({ amount, isMultisig }),
        );

        const txHash = typeof tx === 'string' ? tx : tx.hash;

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(amount, willReceive, txHash);

        if (typeof tx === 'object') {
          await runWithTransactionLogger(
            'Unwrap block confirmation',
            async () => tx.wait(),
          );
        }

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
      onConfirm,
      onRetry,
      processWrapTx,
      providerWeb3,
      txModalStages,
      stETHContractRPC,
      wstETHContractRPC,
    ],
  );
};
