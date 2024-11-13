import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import {
  TransactionCallback,
  TransactionCallbackStage,
} from '@lidofinance/lido-ethereum-sdk';

import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { RequestStatusClaimable } from 'features/withdrawals/types/request-status';
import { useTxModalStagesClaim } from 'features/withdrawals/claim/transaction-modal-claim/use-tx-modal-stages-claim';
import { useDappStatus, useLidoSDK } from 'modules/web3';

type Args = {
  onRetry?: () => void;
};

export const useClaim = ({ onRetry }: Args) => {
  const { address } = useDappStatus();
  const { withdraw } = useLidoSDK();
  const { optimisticClaimRequests } = useClaimData();
  const { txModalStages } = useTxModalStagesClaim();

  const showSuccessTxModal = useCallback(
    async (
      txHash: `0x${string}`,
      amount: bigint,
      sortedRequests: RequestStatusClaimable[],
    ) => {
      await optimisticClaimRequests(sortedRequests);
      txModalStages.success(amount, txHash);
    },
    [optimisticClaimRequests, txModalStages],
  );

  return useCallback(
    async (sortedRequests: RequestStatusClaimable[]) => {
      try {
        invariant(sortedRequests, 'must have requests');
        invariant(address, 'must have address');

        const amount = sortedRequests.reduce(
          (s, r) => s + r.claimableEth,
          BigInt(0),
        );

        const requestsIds = sortedRequests.map((r) => r.id);
        const hints = sortedRequests.map((r) => r.hint);

        const txCallback: TransactionCallback = ({ stage, payload }) => {
          switch (stage) {
            case TransactionCallbackStage.SIGN:
              txModalStages.sign(amount);
              break;
            case TransactionCallbackStage.RECEIPT:
              txModalStages.pending(amount, payload);
              break;
            case TransactionCallbackStage.CONFIRMATION:
              // TODO: move this to `TransactionCallbackStage.DONE` ?
              //  add the 'transactionHash' to 'payload' of `TransactionCallbackStage.DONE` ?
              void showSuccessTxModal(
                payload?.transactionHash,
                amount,
                sortedRequests,
              );
              break;
            case TransactionCallbackStage.MULTISIG_DONE:
              txModalStages.successMultisig();
              break;
            case TransactionCallbackStage.ERROR:
              txModalStages.failed(payload, onRetry);
              break;
            default:
          }
        };

        await withdraw.claim.claimRequests({
          requestsIds,
          hints,
          callback: txCallback,
        });

        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [address, withdraw.claim, txModalStages, showSuccessTxModal, onRetry],
  );
};
