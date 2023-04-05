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

type TxStageSuccessProps = {
  txHash: string | null;
  description: React.ReactNode;
  title: string;
  showEtherscan?: boolean;
};

export const TxStageSuccess: FC<TxStageSuccessProps> = (props) => {
  const { txHash, description, title, children, showEtherscan = true } = props;
  const { isLedger } = useConnectorInfo();

  const currentIconDict = iconsDict[isLedger ? 'ledger' : 'default'];

  return (
    <TextWrapper>
      {currentIconDict[TX_STAGE.SUCCESS]}
      <BoldText size="sm">{title}</BoldText>
      <MiddleDescription size="xs" color="secondary">
        {description}
      </MiddleDescription>
      {showEtherscan && txHash && (
        <BottomDescription size="xxs" color="secondary">
          <EtherscanTxLink txHash={txHash} />
        </BottomDescription>
      )}
      {children}
    </TextWrapper>
  );
};
