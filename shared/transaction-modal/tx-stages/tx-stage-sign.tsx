import { FC } from 'react';

import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconSign } from './icons';

type TxStageSignProps = {
  description: React.ReactNode;
  title: React.ReactNode;
};

export const TxStageSign: FC<TxStageSignProps> = (props) => {
  const { title, description } = props;

  return (
    <TransactionModalContent
      icon={<StageIconSign />}
      title={title}
      description={description}
      footerHint="Confirm this transaction in your wallet"
    />
  );
};
