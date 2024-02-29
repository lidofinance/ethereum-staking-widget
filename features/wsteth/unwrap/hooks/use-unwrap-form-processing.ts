import invariant from 'tiny-invariant';

import { useCallback } from 'react';
import {
  useSDK,
  useSTETHContractRPC,
  useWSTETHContractRPC,
} from '@lido-sdk/react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useUnwrapTxProcessing } from './use-unwrap-tx-processing';
import { useTxModalStagesUnwrap } from './use-tx-modal-stages-unwrap';

import { isContract } from 'utils/isContract';
import { runWithTransactionLogger } from 'utils';
import type { UnwrapFormInputType } from '../unwrap-form-context';

type UseUnwrapFormProcessorArgs = {
  onConfirm?: () => Promise<void>;
  onRetry?: () => void;
};

export const useUnwrapFormProcessor = ({
  onConfirm,
  onRetry,
}: UseUnwrapFormProcessorArgs) => {
  const { account } = useWeb3();
  const { providerWeb3 } = useSDK();
  const processWrapTx = useUnwrapTxProcessing();
  const stETHContractRPC = useSTETHContractRPC();
  const wstETHContractRPC = useWSTETHContractRPC();
  const { createTxModalSession } = useTxModalStagesUnwrap();

  return useCallback(
    async ({ amount }: UnwrapFormInputType) => {
      invariant(amount, 'amount should be presented');
      invariant(account, 'address should be presented');
      invariant(providerWeb3, 'provider should be presented');
      const isMultisig = await isContract(account, providerWeb3);
      const willReceive = await wstETHContractRPC.getStETHByWstETH(amount);

      const txModalStages = createTxModalSession();

      try {
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

        const stethBalance = await stETHContractRPC.balanceOf(account);

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
      account,
      onConfirm,
      onRetry,
      processWrapTx,
      providerWeb3,
      createTxModalSession,
      stETHContractRPC,
      wstETHContractRPC,
    ],
  );
};
