import { FC } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { ErrorMessage } from 'utils';

import { iconsDict } from './icons';
import {
  BoldText,
  TextWrapper,
  MiddleDescription,
  BottomDescription,
  RetryButtonStyled,
} from './styles';
import { TX_STAGE } from '../types';

type TxStageFailProps = {
  failedText: string | null;
  onClick?: () => void;
};

export const TxStageFail: FC<TxStageFailProps> = (props) => {
  const { failedText, onClick } = props;
  const { isLedger } = useConnectorInfo();

  const currentIconDict = iconsDict[isLedger ? 'ledger' : 'default'];

  return (
    <TextWrapper>
      {currentIconDict[TX_STAGE.FAIL]}
      <BoldText size="sm">Metamask tx signature</BoldText>
      <MiddleDescription size="xs" color="secondary">
        {failedText ?? 'Something went wrong'}
      </MiddleDescription>
      <BottomDescription size="xxs" color="secondary">
        {failedText !== ErrorMessage.NOT_ENOUGH_ETHER && (
          <RetryButtonStyled onClick={onClick}>Retry</RetryButtonStyled>
        )}
      </BottomDescription>
    </TextWrapper>
  );
};
