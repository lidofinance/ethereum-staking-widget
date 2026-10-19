import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconWarning } from 'shared/transaction-modal/tx-stages-basic/icons';

export const TxStageInstantWithdrawalUnavailable = () => {
  return (
    <TransactionModalContent
      icon={<StageIconWarning />}
      title="Instant withdrawal is no longer available"
      description="Either the instant-withdrawal buffer was depleted or the vault's price feed went out of date while your transaction was being signed. You can try again in a few minutes, or withdraw now using the standard flow."
    />
  );
};
