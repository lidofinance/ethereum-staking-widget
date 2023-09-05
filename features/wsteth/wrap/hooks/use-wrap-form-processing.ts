import invariant from 'tiny-invariant';

import { useCallback } from 'react';
import { useSDK } from '@lido-sdk/react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useWrapTxProcessing } from './use-wrap-tx-processing';
import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';

import { getErrorMessage, runWithTransactionLogger } from 'utils';
import { isContract } from 'utils/isContract';
import { TX_STAGE } from 'features/withdrawals/shared/tx-stage-modal';
import type {
  WrapFormApprovalData,
  WrapFormInputType,
} from '../wrap-form-context';

type UseWrapFormProcessorArgs = {
  approvalData: WrapFormApprovalData;
  onConfirm?: () => Promise<void>;
};

export const useWrapFormProcessor = ({
  approvalData,
  onConfirm,
}: UseWrapFormProcessorArgs) => {
  const { account } = useWeb3();
  const { providerWeb3 } = useSDK();
  const { dispatchModalState } = useTransactionModal();
  const processWrapTx = useWrapTxProcessing();
  const { isApprovalNeededBeforeWrap, processApproveTx } = approvalData;

  return useCallback(
    async ({ amount, token }: WrapFormInputType) => {
      invariant(amount, 'amount should be presented');
      invariant(account, 'address should be presented');
      invariant(providerWeb3, 'provider should be presented');
      const isMultisig = await isContract(account, providerWeb3);

      try {
        dispatchModalState({
          type: 'start',
          flow: isApprovalNeededBeforeWrap ? TX_STAGE.APPROVE : TX_STAGE.SIGN,
          token: token as any, // TODO: refactor modal state to be reusable to remove any
          requestAmount: amount,
        });

        if (isApprovalNeededBeforeWrap) {
          await processApproveTx();
          if (isMultisig) {
            dispatchModalState({ type: 'success_multisig' });
            return true;
          }
          dispatchModalState({ type: 'signing' });
        }

        const transaction = await runWithTransactionLogger('Wrap signing', () =>
          processWrapTx({ amount, token, isMultisig }),
        );

        if (isMultisig) {
          dispatchModalState({ type: 'success_multisig' });
          return true;
        }

        if (typeof transaction === 'object') {
          dispatchModalState({ type: 'block', txHash: transaction.hash });
          await runWithTransactionLogger('Wrap block confirmation', () =>
            transaction.wait(),
          );
        }

        await onConfirm?.();
        dispatchModalState({ type: 'success' });
        return true;
      } catch (error) {
        console.warn(error);
        dispatchModalState({
          type: 'error',
          errorText: getErrorMessage(error),
        });
        return false;
      }
    },
    [
      account,
      providerWeb3,
      dispatchModalState,
      isApprovalNeededBeforeWrap,
      processApproveTx,
      processWrapTx,
      onConfirm,
    ],
  );
};
