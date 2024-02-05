import { FC } from 'react';

import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconSign } from './icons';

export const TxStagePermit: FC = () => {
  return (
    <TransactionModalContent
      icon={<StageIconSign />}
      title="Please sign the message"
      description="Processing your request"
      footerHint="Confirm request in your wallet"
    />
  );
};
