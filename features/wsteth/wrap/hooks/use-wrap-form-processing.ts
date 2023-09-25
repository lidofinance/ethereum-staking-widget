import invariant from 'tiny-invariant';
import { useCallback } from 'react';

import { useSDK } from '@lido-sdk/react';
import { trackEvent } from '@lidofinance/analytics-matomo';
import { useWeb3 } from 'reef-knot/web3-react';

import { MATOMO_CLICK_EVENTS } from 'config';
import { useTransactionModal, TX_OPERATION } from 'shared/transaction-modal';
import { getErrorMessage, runWithTransactionLogger } from 'utils';
import { isContract } from 'utils/isContract';

import { useWrapTxProcessing } from './use-wrap-tx-processing';
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

      trackEvent(...MATOMO_CLICK_EVENTS.clickWrapButton);

      try {
        dispatchModalState({
          type: 'start',
          operation: isApprovalNeededBeforeWrap
            ? TX_OPERATION.APPROVE
            : TX_OPERATION.CONTRACT,
          token,
          amount,
        });

        if (isApprovalNeededBeforeWrap) {
          await processApproveTx({
            onTxSent: (tx) => {
              if (!isMultisig)
                dispatchModalState({
                  type: 'block',
                  txHash: typeof tx === 'string' ? tx : tx.hash,
                  operation: TX_OPERATION.APPROVE,
                });
            },
          });
          if (isMultisig) {
            dispatchModalState({ type: 'success_multisig' });
            return true;
          }
          dispatchModalState({
            type: 'signing',
            operation: TX_OPERATION.CONTRACT,
          });
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
