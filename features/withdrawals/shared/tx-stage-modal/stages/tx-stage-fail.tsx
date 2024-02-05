import { FC } from 'react';

import { ErrorMessage } from 'utils';

import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { StageIconFail } from './icons';
import { RetryButtonStyled } from './styles';

type TxStageFailProps = {
  failedText: string | null;
  onClick?: () => void;
};

export const TxStageFail: FC<TxStageFailProps> = (props) => {
  const { failedText, onClick } = props;

  return (
    <TxStageModalContent
      title="Transaction Error"
      icon={<StageIconFail />}
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
