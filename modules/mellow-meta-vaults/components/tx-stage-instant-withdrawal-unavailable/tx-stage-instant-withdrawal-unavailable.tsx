import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconWarning } from 'shared/transaction-modal/tx-stages-basic/icons';

export const TxStageInstantWithdrawalUnavailable = () => {
  return (
    <TransactionModalContent
      icon={<StageIconWarning />}
      title="Instant withdrawal is no longer available"
      description="The buffer was depleted before your transaction was confirmed. Please try again using the standard withdrawal flow."
    />
  );
};
