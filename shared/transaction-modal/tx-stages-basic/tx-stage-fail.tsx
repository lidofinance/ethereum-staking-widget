import { useCallback, useState } from 'react';
import { ErrorMessage } from 'utils';

import { Loader } from '@lidofinance/lido-ui';
import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconFail } from './icons';
import { RetryButtonStyled, LoaderWrapper } from './styles';

type TxStageFailProps = {
  failedText?: string | null;
  onRetry?: React.MouseEventHandler<HTMLSpanElement>;
};

export const TxStageFail = ({ failedText, onRetry }: TxStageFailProps) => {
  const [isLoading, setLoading] = useState(false);
  const handleRetry = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      setLoading(true);
      onRetry?.(e);
    },
    [onRetry],
  );
  return (
    <TransactionModalContent
      title="Transaction Failed"
      icon={<StageIconFail />}
      description={failedText ?? 'Something went wrong'}
      footerHint={
        failedText !== ErrorMessage.NOT_ENOUGH_ETHER &&
        onRetry &&
        (!isLoading ? (
          <RetryButtonStyled onClick={handleRetry}>Retry</RetryButtonStyled>
        ) : (
          <LoaderWrapper>
            <Loader size="small" />
          </LoaderWrapper>
        ))
      }
    />
  );
};
