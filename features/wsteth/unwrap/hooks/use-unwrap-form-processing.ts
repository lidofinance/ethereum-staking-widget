import invariant from 'tiny-invariant';

import { useCallback } from 'react';
import { useSDK } from '@lido-sdk/react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useUnwrapTxProcessing } from './use-unwrap-tx-processing';
import { useTransactionModal, TX_OPERATION } from 'shared/transaction-modal';

import { isContract } from 'utils/isContract';
import { getErrorMessage, runWithTransactionLogger } from 'utils';
import { TOKENS } from 'shared/hook-form/controls/token-select-hook-form';
import type { UnwrapFormInputType } from '../unwrap-form-context';

type UseUnwrapFormProcessorArgs = {
  onConfirm?: () => Promise<void>;
};

export const useUnwrapFormProcessor = ({
  onConfirm,
}: UseUnwrapFormProcessorArgs) => {
  const { account } = useWeb3();
  const { providerWeb3 } = useSDK();
  const { dispatchModalState } = useTransactionModal();
  const processWrapTx = useUnwrapTxProcessing();

  return useCallback(
    async ({ amount }: UnwrapFormInputType) => {
      invariant(amount, 'amount should be presented');
      invariant(account, 'address should be presented');
      invariant(providerWeb3, 'provider should be presented');
      const isMultisig = await isContract(account, providerWeb3);

      try {
        dispatchModalState({
          type: 'start',
          operation: TX_OPERATION.CONTRACT,
          token: TOKENS.WSTETH,
          amount,
        });

        const transaction = await runWithTransactionLogger(
          'Unwrap signing',
          () => processWrapTx({ amount, isMultisig }),
        );

        if (isMultisig) {
          dispatchModalState({ type: 'success_multisig' });
          return true;
        }

        if (typeof transaction === 'object') {
          dispatchModalState({ type: 'block', txHash: transaction.hash });
          await runWithTransactionLogger(
            'Unwrap block confirmation',
            async () => transaction.wait(),
          );
        }

        await onConfirm?.();
        dispatchModalState({ type: 'success' });
        return true;
      } catch (error: any) {
        console.warn(error);
        dispatchModalState({
          type: 'error',
          errorText: getErrorMessage(error),
        });
        return false;
      }
    },
    [account, dispatchModalState, onConfirm, processWrapTx, providerWeb3],
  );
};
