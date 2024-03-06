import { Button } from '@lidofinance/lido-ui';

import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconDialog } from './icons';
import { BottomButtons } from './styles';

type TxStageBunkerProps = {
  onClick?: () => void;
  onClose?: () => void;
};

export const TxStageBunker = ({ onClick, onClose }: TxStageBunkerProps) => {
  return (
    <TransactionModalContent
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
