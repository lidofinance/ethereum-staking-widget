import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import {
  TransactionCallback,
  TransactionCallbackStage,
} from '@lidofinance/lido-ethereum-sdk';

import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { RequestStatusClaimable } from 'features/withdrawals/types/request-status';
import { useTxModalStagesClaim } from 'features/withdrawals/claim/transaction-modal-claim/use-tx-modal-stages-claim';
import { useAA, useDappStatus, useLidoSDK, useSendAACalls } from 'modules/web3';

import type { Hash } from 'viem';

type Args = {
  onRetry?: () => void;
};

export const useClaim = ({ onRetry }: Args) => {
  const { address } = useDappStatus();
  const { withdraw } = useLidoSDK();
  const { isAA } = useAA();
  const sendAACalls = useSendAACalls();

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

        if (isAA) {
          const claimCall = await withdraw.claim.claimRequestsPopulateTx({
            requestsIds,
            hints,
          });

          await sendAACalls([claimCall], async (props) => {
            switch (props.stage) {
              case TransactionCallbackStage.SIGN:
                txModalStages.sign(amount);
                break;
              case TransactionCallbackStage.RECEIPT:
                txModalStages.pending(amount, props.callId as Hash, isAA);
                break;
              case TransactionCallbackStage.DONE: {
                await optimisticClaimRequests(sortedRequests);
                txModalStages.success(amount, props.txHash);
                break;
              }
              case TransactionCallbackStage.ERROR: {
                txModalStages.failed(props.error, onRetry);
                break;
              }
              default:
                break;
            }
          });

          return true;
        }

        let txHash: Hash | undefined = undefined;
        const txCallback: TransactionCallback = async ({ stage, payload }) => {
          switch (stage) {
            case TransactionCallbackStage.SIGN:
              txModalStages.sign(amount);
              break;
            case TransactionCallbackStage.RECEIPT:
              txModalStages.pending(amount, payload);
              // the payload here is txHash
              txHash = payload;
              break;
            case TransactionCallbackStage.DONE:
              await optimisticClaimRequests(sortedRequests);
              txModalStages.success(amount, txHash);
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
    [
      address,
      isAA,
      withdraw.claim,
      txModalStages,
      sendAACalls,
      optimisticClaimRequests,
      onRetry,
    ],
  );
};
