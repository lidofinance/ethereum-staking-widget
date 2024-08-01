import { useCallback } from 'react';
import { BigNumber } from 'ethers';

import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { runWithTransactionLogger } from 'utils';

import { useWithdrawalsContract } from './useWithdrawalsContract';
import { RequestStatusClaimable } from 'features/withdrawals/types/request-status';
import invariant from 'tiny-invariant';
import { isContract } from 'utils/isContract';
import { useWeb3 } from 'reef-knot/web3-react';
import { useSDK } from '@lido-sdk/react';
import { useTxModalStagesClaim } from 'features/withdrawals/claim/transaction-modal-claim/use-tx-modal-stages-claim';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { sendTx } from 'utils/send-tx';

type Args = {
  onRetry?: () => void;
};

export const useClaim = ({ onRetry }: Args) => {
  const { account } = useWeb3();
  const { providerWeb3 } = useSDK();
  const { contractWeb3 } = useWithdrawalsContract();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const { optimisticClaimRequests } = useClaimData();
  const { txModalStages } = useTxModalStagesClaim();

  return useCallback(
    async (sortedRequests: RequestStatusClaimable[]) => {
      try {
        invariant(contractWeb3, 'must have contract');
        invariant(sortedRequests, 'must have requests');
        invariant(account, 'must have address');
        invariant(providerWeb3, 'must have provider');

        const isMultisig = await isContract(account, contractWeb3.provider);

        const amount = sortedRequests.reduce(
          (s, r) => s.add(r.claimableEth),
          BigNumber.from(0),
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

        await runWithTransactionLogger('Claim block confirmation', async () =>
          staticRpcProvider.waitForTransaction(txHash),
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
      account,
      providerWeb3,
      txModalStages,
      staticRpcProvider,
      optimisticClaimRequests,
      onRetry,
    ],
  );
};
