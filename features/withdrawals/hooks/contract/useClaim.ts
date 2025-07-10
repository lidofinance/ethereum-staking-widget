import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { RequestStatusClaimable } from 'features/withdrawals/types/request-status';
import { useTxModalStagesClaim } from 'features/withdrawals/claim/transaction-modal-claim/use-tx-modal-stages-claim';
import { useAA, useDappStatus, useLidoSDK, useTxFlow } from 'modules/web3';

type Args = {
  onRetry?: () => void;
};

export const useClaim = ({ onRetry }: Args) => {
  const { address } = useDappStatus();
  const { withdraw } = useLidoSDK();
  const { isAA } = useAA();
  const txFlow = useTxFlow();

  const { optimisticClaimRequests } = useClaimData();
  const { txModalStages } = useTxModalStagesClaim();

  return useCallback(
    async (sortedRequests: RequestStatusClaimable[]) => {
      try {
        invariant(sortedRequests, 'must have requests');
        invariant(address, 'must have address');

        const amount = sortedRequests.reduce((s, r) => s + r.claimableEth, 0n);

        const requestsIds = sortedRequests.map((r) => r.id);
        const hints = sortedRequests.map((r) => r.hint);

        await txFlow({
          callsFn: async () => {
            return [
              await withdraw.claim.claimRequestsPopulateTx({
                requestsIds,
                hints,
              }),
            ];
          },
          sendTransaction: async (txStagesCallback) => {
            await withdraw.claim.claimRequests({
              requestsIds,
              hints,
              callback: txStagesCallback,
            });
          },
          onSign: async () => {
            txModalStages.sign(amount);
          },
          onReceipt: async ({ txHashOrCallId }) => {
            txModalStages.pending(amount, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            await optimisticClaimRequests(sortedRequests);
            txModalStages.success(amount, txHash);
          },
          onFailure: ({ error }) => {
            txModalStages.failed(error, onRetry);
          },
          onMultisigDone: () => {
            txModalStages.successMultisig();
          },
        });

        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      address,
      txFlow,
      withdraw.claim,
      txModalStages,
      isAA,
      optimisticClaimRequests,
      onRetry,
    ],
  );
};
