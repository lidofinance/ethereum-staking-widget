import { FC } from 'react';
import { useConnectorInfo } from 'reef-knot';

import { iconsDict } from './icons';
import {
  BoldText,
  TextWrapper,
  BottomDescription,
  MiddleDescription,
} from './styles';
import { TX_STAGE } from '../types';

export const TxStagePermit: FC = () => {
  const { isLedger } = useConnectorInfo();

  const currentIconDict = iconsDict[isLedger ? 'ledger' : 'default'];

  return (
    <TextWrapper>
      {currentIconDict[TX_STAGE.PERMIT]}
      <BoldText size="sm">Please sign the message</BoldText>
      <MiddleDescription size="xs" color="secondary">
        Processing your request
      </MiddleDescription>
      <BottomDescription size="xxs" color="secondary">
        Confirm request in your wallet
      </BottomDescription>
    </TextWrapper>
  );
};
