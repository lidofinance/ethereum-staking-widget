import { ErrorMessage } from 'utils';

import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconFail } from './icons';
import { RetryButtonStyled } from './styles';

type TxStageFailProps = {
  failedText?: string | null;
  onRetry?: React.MouseEventHandler<HTMLSpanElement>;
};

export const TxStageFail = ({ failedText, onRetry }: TxStageFailProps) => {
  return (
    <TransactionModalContent
      title="Transaction Failed"
      icon={<StageIconFail />}
      description={failedText ?? 'Something went wrong'}
      footerHint={
        failedText !== ErrorMessage.NOT_ENOUGH_ETHER &&
        onRetry && (
          <RetryButtonStyled onClick={onRetry}>Retry</RetryButtonStyled>
        )
      }
    />
  );
};
