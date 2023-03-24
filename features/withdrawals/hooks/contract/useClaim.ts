import { useCallback } from 'react';
import { BigNumber } from 'ethers';

import { TX_STAGE } from 'features/withdrawals/shared/tx-stage-modal';
import { useClaimData, useClaimTxModal } from 'features/withdrawals/hooks';
import { getErrorMessage, runWithTransactionLogger } from 'utils';

import { useWithdrawalsContract } from './useWithdrawalsContract';
import { ClaimableRequestStatus } from './useWithdrawalsData';

export const useClaim = () => {
  const { contractWeb3, contractRpc } = useWithdrawalsContract();
  const { withdrawalRequestsData, ethToClaim } = useClaimData();
  const {
    setTxHash,
    setTxStage,
    openTxModal,
    setRequestAmount,
    setTxModalFailedText,
  } = useClaimTxModal();

  return useCallback(
    async (requests: ClaimableRequestStatus[]) => {
      if (!contractWeb3 || !contractRpc || !requests) return;
      setRequestAmount(ethToClaim || BigNumber.from(0));

      const sortedRequests = [...requests].sort((aReq, bReq) =>
        aReq.id.gt(bReq.id) ? 1 : -1,
      );

      const callback = () =>
        contractWeb3.claimWithdrawals(
          sortedRequests.map((r) => r.id),
          sortedRequests.map((r) => r.hint),
        );

      setTxStage(TX_STAGE.SIGN);
      openTxModal();

      try {
        const transaction = await runWithTransactionLogger(
          'Claim signing',
          callback,
        );

        setTxHash(transaction.hash);
        setTxStage(TX_STAGE.BLOCK);
        openTxModal();

        await runWithTransactionLogger('Stake block confirmation', async () =>
          transaction.wait(),
        );
        await withdrawalRequestsData.update();

        setTxStage(TX_STAGE.SUCCESS);
        openTxModal();
      } catch (error) {
        console.error(error);
        const errorMessage = getErrorMessage(error);
        setTxModalFailedText(errorMessage);
        setTxStage(TX_STAGE.FAIL);
        setTxHash(undefined);
        openTxModal();
      }
    },
    [
      contractWeb3,
      contractRpc,
      setRequestAmount,
      ethToClaim,
      setTxStage,
      openTxModal,
      setTxHash,
      withdrawalRequestsData,
      setTxModalFailedText,
    ],
  );
};
