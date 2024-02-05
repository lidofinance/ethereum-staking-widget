import { FC } from 'react';

import { ErrorMessage } from 'utils';

import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { StageIconFail } from './icons';
import { RetryButtonStyled } from './styles';

type TxStageFailProps = {
  failedText?: string | null;
  onClickRetry?: React.MouseEventHandler<HTMLSpanElement>;
};

export const TxStageFail: FC<TxStageFailProps> = (props) => {
  const { failedText, onClickRetry } = props;

  return (
    <TxStageModalContent
      title="Transaction Failed"
      icon={<StageIconFail />}
      description={failedText ?? 'Something went wrong'}
      footerHint={
        failedText !== ErrorMessage.NOT_ENOUGH_ETHER &&
        onClickRetry && (
          <RetryButtonStyled onClick={onClickRetry}>Retry</RetryButtonStyled>
        )
      }
    />
  );
};
