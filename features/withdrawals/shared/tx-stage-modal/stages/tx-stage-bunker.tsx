import { FC } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';
import { Button } from '@lidofinance/lido-ui';

import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { getStageIcon } from './icons';
import { BottomButtons } from './styles';
import { TX_STAGE } from '../types';

type TxStageFailProps = {
  failedText?: string;
  onClick?: () => void;
  onClose?: () => void;
};

export const TxStageBunker: FC<TxStageFailProps> = (props) => {
  const { onClick, onClose } = props;
  const { isLedger } = useConnectorInfo();

  return (
    <TxStageModalContent
      icon={getStageIcon(isLedger, TX_STAGE.BUNKER)}
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
