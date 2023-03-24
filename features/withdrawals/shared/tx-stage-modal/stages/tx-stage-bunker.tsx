import { FC } from 'react';
import { useConnectorInfo } from 'reef-knot';
import { Button } from '@lidofinance/lido-ui';

import { iconsDict } from './icons';
import {
  BoldText,
  TextWrapper,
  MiddleDescription,
  BottomButtons,
} from './styles';
import { TX_STAGE } from '../types';

type TxStageFailProps = {
  failedText?: string;
  onClick?: () => void;
  onClose?: () => void;
};

export const TxStageBunker: FC<TxStageFailProps> = (props) => {
  const { onClick, onClose } = props;
  const { isLedger } = useConnectorInfo();

  const currentIconDict = iconsDict[isLedger ? 'ledger' : 'default'];

  return (
    <TextWrapper>
      {currentIconDict[TX_STAGE.BUNKER]}
      <BoldText size="sm">Attention!</BoldText>
      <MiddleDescription size="xs" color="secondary">
        Because of slashing, the unstaking period will last longer than usual,
        still request withdrawal?
      </MiddleDescription>
      <BottomButtons>
        <Button fullwidth onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button fullwidth onClick={onClick}>
          Request withdrawal
        </Button>
      </BottomButtons>
    </TextWrapper>
  );
};
