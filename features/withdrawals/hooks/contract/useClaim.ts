import { useCallback } from 'react';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';

import { useSDK } from '@lido-sdk/react';

import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { RequestStatusClaimable } from 'features/withdrawals/types/request-status';
import { useTxModalStagesClaim } from 'features/withdrawals/claim/transaction-modal-claim/use-tx-modal-stages-claim';
import { runWithTransactionLogger } from 'utils';
import { isContract } from 'utils/isContract';

import { useWithdrawalsContract } from './useWithdrawalsContract';

type Args = {
  onRetry?: () => void;
};

export const useClaim = ({ onRetry }: Args) => {
  const { address } = useAccount();
  const { providerWeb3 } = useSDK();
  const { contractWeb3 } = useWithdrawalsContract();
  const { optimisticClaimRequests } = useClaimData();
  const { txModalStages } = useTxModalStagesClaim();

  return useCallback(
    async (sortedRequests: RequestStatusClaimable[]) => {
      try {
        invariant(contractWeb3, 'must have contract');
        invariant(sortedRequests, 'must have requests');
        invariant(address, 'must have address');
        invariant(providerWeb3, 'must have provider');

        const isMultisig = await isContract(address, contractWeb3.provider);

        const amount = sortedRequests.reduce(
          (s, r) => s.add(r.claimableEth),
          BigNumber.from(0),
        );

        txModalStages.sign(amount);

        const ids = sortedRequests.map((r) => r.id);
        const hints = sortedRequests.map((r) => r.hint);
        const callback = async () => {
          if (isMultisig) {
            const tx = await contractWeb3.populateTransaction.claimWithdrawals(
              ids,
              hints,
            );
            return providerWeb3.getSigner().sendUncheckedTransaction(tx);
          } else {
            const feeData = await contractWeb3.provider.getFeeData();
            const maxFeePerGas = feeData.maxFeePerGas ?? undefined;
            const maxPriorityFeePerGas =
              feeData.maxPriorityFeePerGas ?? undefined;
            const gasLimit = await contractWeb3.estimateGas.claimWithdrawals(
              ids,
              hints,
              {
                maxFeePerGas,
                maxPriorityFeePerGas,
              },
            );
            return contractWeb3.claimWithdrawals(ids, hints, {
              maxFeePerGas,
              maxPriorityFeePerGas,
              gasLimit,
            });
          }
        };

        const tx = await runWithTransactionLogger('Claim signing', callback);
        const txHash = typeof tx === 'string' ? tx : tx.hash;

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(amount, txHash);

        if (typeof tx === 'object') {
          await runWithTransactionLogger('Claim block confirmation', async () =>
            tx.wait(),
          );
          // we only update if we wait for tx
          await optimisticClaimRequests(sortedRequests);
        }

        txModalStages.success(amount, txHash);
        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      contractWeb3,
      address,
      providerWeb3,
      optimisticClaimRequests,
      txModalStages,
      onRetry,
    ],
  );
};
