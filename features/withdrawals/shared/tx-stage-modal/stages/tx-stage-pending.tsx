import { FC } from 'react';
import { useConnectorInfo } from 'reef-knot';

import { EtherscanTxLink } from '../etherscan-tx-link';
import { iconsDict } from './icons';
import {
  BoldText,
  TextWrapper,
  MiddleDescription,
  BottomDescription,
} from './styles';
import { TX_STAGE } from '../types';

type TxStagePendingProps = {
  description: string;
  title: string;
  txHash?: string;
};

export const TxStagePending: FC<TxStagePendingProps> = (props) => {
  const { title, description, txHash } = props;
  const { isLedger } = useConnectorInfo();

  const currentIconDict = iconsDict[isLedger ? 'ledger' : 'default'];

  return (
    <TextWrapper>
      {currentIconDict[TX_STAGE.BLOCK]}
      <BoldText size="sm">{title}</BoldText>
      <MiddleDescription size="xs" color="secondary">
        {description}
      </MiddleDescription>
      <BottomDescription size="xxs" color="secondary">
        <EtherscanTxLink txHash={txHash} />
      </BottomDescription>
    </TextWrapper>
  );
};
