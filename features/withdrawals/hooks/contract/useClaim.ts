import { zeroHash, type Hash } from 'viem';
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
          const wq = await withdraw.contract.getContractWithdrawalQueue();
          const calls: unknown[] = [];
          calls.push({
            to: wq.address,
            abi: wq.abi,
            functionName: 'claimWithdrawals',
            args: [requestsIds, hints] as const,
          });

          txModalStages.sign(amount);
          const callStatus = await sendAACalls(calls, (props) => {
            if (props.stage === 'sent')
              txModalStages.pending(amount, props.callId as Hash, isAA);
          });

          await optimisticClaimRequests(sortedRequests);
          // extract last receipt if there was no atomic batch
          const txHash = callStatus.receipts
            ? callStatus.receipts[callStatus.receipts.length - 1]
                .transactionHash
            : zeroHash;

          txModalStages.success(amount, txHash);

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
      withdraw.contract,
      txModalStages,
      sendAACalls,
      optimisticClaimRequests,
      onRetry,
    ],
  );
};
