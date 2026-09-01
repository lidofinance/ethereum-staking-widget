import type { Hash } from 'viem';
import { useCallback } from 'react';

import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import {
  type TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import {
  TxStagePending,
  TxStageSign,
  TxStageSuccess,
} from 'shared/transaction-modal/tx-stages-basic';
import { ClaimAmounts } from '../../components/withdraw-claim-amounts';
import type { UsdVaultWithdrawClaimAmount } from '../claim-all-utils';

const getTxModalStages = (
  transitStage: TransactionModalTransitStage,
  amounts: UsdVaultWithdrawClaimAmount[],
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: () =>
    transitStage(
      <TxStageSign
        title="Claim withdrawals"
        description={<ClaimAmounts amounts={amounts} />}
      />,
    ),

  pending: (txHash?: Hash, isAA?: boolean) =>
    transitStage(
      <TxStagePending
        title="Claiming withdrawals"
        description={<ClaimAmounts amounts={amounts} />}
        txHash={txHash}
        isAA={isAA}
      />,
    ),

  success: (txHash?: Hash) =>
    transitStage(
      <TxStageSuccess
        txHash={txHash}
        title="Withdrawals have been claimed."
        description={<ClaimAmounts amounts={amounts} />}
        showEtherscan
      />,
      { isClosableOnLedger: true },
    ),
});

export const useUsdVaultWithdrawClaimAllTxModal = (
  amounts: UsdVaultWithdrawClaimAmount[],
) => {
  const getStages = useCallback(
    (transitStage: TransactionModalTransitStage) =>
      getTxModalStages(transitStage, amounts),
    [amounts],
  );

  return useTransactionModalStage(getStages);
};
