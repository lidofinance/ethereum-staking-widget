import { FC } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { ErrorMessage } from 'utils';

import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { getStageIcon } from './icons';
import { RetryButtonStyled } from './styles';
import { TX_STAGE } from 'shared/transaction-modal';

type TxStageFailProps = {
  failedText: string | null;
  onClick?: () => void;
};

export const TxStageFail: FC<TxStageFailProps> = (props) => {
  const { failedText, onClick } = props;
  const { isLedger } = useConnectorInfo();

  return (
    <TxStageModalContent
      icon={getStageIcon(isLedger, TX_STAGE.FAIL)}
      title="Transaction Error"
      description={failedText ?? 'Something went wrong'}
      footerHint={
        failedText !== ErrorMessage.NOT_ENOUGH_ETHER &&
        onClick && (
          <RetryButtonStyled onClick={onClick}>Retry</RetryButtonStyled>
        )
      }
    />
  );
};
