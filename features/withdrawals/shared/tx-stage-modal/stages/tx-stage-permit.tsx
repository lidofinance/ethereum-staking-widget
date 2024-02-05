import { FC } from 'react';

import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { StageIconSign } from './icons';

export const TxStagePermit: FC = () => {
  return (
    <TxStageModalContent
      icon={<StageIconSign />}
      title="Please sign the message"
      description="Processing your request"
      footerHint="Confirm request in your wallet"
    />
  );
};
