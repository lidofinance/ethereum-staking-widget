import { FC } from 'react';
import { Button } from '@lidofinance/lido-ui';

import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { StageIconDialog } from './icons';
import { BottomButtons } from './styles';

type TxStageFailProps = {
  failedText?: string;
  onClick?: () => void;
  onClose?: () => void;
};

export const TxStageBunker: FC<TxStageFailProps> = (props) => {
  const { onClick, onClose } = props;

  return (
    <TxStageModalContent
      icon={<StageIconDialog />}
      title="Attention!"
      description="Lido protocol is in “Bunker mode”, the withdrawal requests are slowed down, still request withdrawal?"
      footer={
        <BottomButtons>
          <Button fullwidth onClick={onClose} color="secondary" size="sm">
            Cancel
          </Button>
          <Button fullwidth onClick={onClick} size="sm">
            Request withdrawal
          </Button>
        </BottomButtons>
      }
    />
  );
};
