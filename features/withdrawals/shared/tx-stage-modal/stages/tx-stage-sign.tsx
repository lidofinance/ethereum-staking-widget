import { FC } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { iconsDict } from './icons';
import {
  BoldText,
  TextWrapper,
  BottomDescription,
  MiddleDescription,
} from './styles';
import { TX_STAGE } from '../types';

type TxStageSignProps = {
  description: string;
  title: string;
};

export const TxStageSign: FC<TxStageSignProps> = (props) => {
  const { title, description } = props;
  const { isLedger } = useConnectorInfo();

  const currentIconDict = iconsDict[isLedger ? 'ledger' : 'default'];

  return (
    <TextWrapper>
      {currentIconDict[TX_STAGE.SIGN]}
      <BoldText size="sm">{title}</BoldText>
      <MiddleDescription size="xs" color="secondary">
        {description}
      </MiddleDescription>
      <BottomDescription size="xxs" color="secondary">
        Confirm this transaction in your wallet
      </BottomDescription>
    </TextWrapper>
  );
};
