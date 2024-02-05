import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconSuccess } from './icons';

export const TxStageSuccessMultisig = () => {
  return (
    <TransactionModalContent
      icon={<StageIconSuccess />}
      title="Success"
      description="Your transaction has been successfully created in the multisig wallet and awaits approval from other participants"
    />
  );
};
