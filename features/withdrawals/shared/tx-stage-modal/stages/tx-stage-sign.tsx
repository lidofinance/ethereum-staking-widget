import { FC } from 'react';

import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { StageIconSign } from './icons';

type TxStageSignProps = {
  description: React.ReactNode;
  title: React.ReactNode;
};

export const TxStageSign: FC<TxStageSignProps> = (props) => {
  const { title, description } = props;

  return (
    <TxStageModalContent
      icon={<StageIconSign />}
      title={title}
      description={description}
      footerHint="Confirm this transaction in your wallet"
    />
  );
};
