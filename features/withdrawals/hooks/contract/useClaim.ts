import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { useSDK } from '@lido-sdk/react';

import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { RequestStatusClaimable } from 'features/withdrawals/types/request-status';
import { useTxModalStagesClaim } from 'features/withdrawals/claim/transaction-modal-claim/use-tx-modal-stages-claim';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { runWithTransactionLogger } from 'utils';
import { isContract } from 'utils/isContract';
import { sendTx, useTxConfirmation, useDappStatus } from 'modules/web3';

import { useWithdrawalsContract } from './useWithdrawalsContract';

type Args = {
  onRetry?: () => void;
};

export const useClaim = ({ onRetry }: Args) => {
  const { address } = useDappStatus();
  const { providerWeb3 } = useSDK();
  const { contractWeb3 } = useWithdrawalsContract();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const { optimisticClaimRequests } = useClaimData();
  const { txModalStages } = useTxModalStagesClaim();
  const waitForTx = useTxConfirmation();

  return useCallback(
    async (sortedRequests: RequestStatusClaimable[]) => {
      try {
        invariant(contractWeb3, 'must have contract');
        invariant(sortedRequests, 'must have requests');
        invariant(address, 'must have address');
        invariant(providerWeb3, 'must have provider');

        const isMultisig = await isContract(address, contractWeb3.provider);

        const amount = sortedRequests.reduce(
          (s, r) => s + r.claimableEth,
          BigInt(0),
        );

        txModalStages.sign(amount);

        const ids = sortedRequests.map((r) => r.id);
        const hints = sortedRequests.map((r) => r.hint);
        const callback = async () => {
          const tx = await contractWeb3.populateTransaction.claimWithdrawals(
            ids,
            hints,
          );
          return sendTx({
            tx,
            isMultisig,
            staticProvider: staticRpcProvider,
            walletProvider: providerWeb3,
          });
        };

        const txHash = await runWithTransactionLogger(
          'Claim signing',
          callback,
        );

        if (isMultisig) {
          txModalStages.successMultisig();
          return true;
        }

        txModalStages.pending(amount, txHash);

        await runWithTransactionLogger('Claim block confirmation', () =>
          waitForTx(txHash),
        );

        await optimisticClaimRequests(sortedRequests);

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
      txModalStages,
      optimisticClaimRequests,
      staticRpcProvider,
      waitForTx,
      onRetry,
    ],
  );
};
