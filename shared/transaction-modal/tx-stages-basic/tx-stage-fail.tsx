import { useCallback, useState } from 'react';
import { ErrorMessage } from 'utils';

import { Loader } from '@lidofinance/lido-ui';
import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconFail, StageIconSuccess } from './icons';
import { ModalFooterButton, LoaderWrapper } from './styles';

type TxStageFailProps = {
  failedText?: React.ReactNode;
  onRetry?: React.MouseEventHandler<HTMLSpanElement>;
  footer?: React.ReactNode;
};

export const TxStageFail = ({
  failedText,
  onRetry,
  footer,
}: TxStageFailProps) => {
  const [isLoading, setLoading] = useState(false);
  const handleRetry = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      setLoading(true);
      onRetry?.(e);
    },
    [onRetry],
  );
  // The transaction itself went through, only a follow-up read failed:
  // retrying would submit it again
  const isSettled = failedText === ErrorMessage.TX_SETTLED_DATA_UNAVAILABLE;

  return (
    <TransactionModalContent
      title={isSettled ? 'Transaction completed' : 'Transaction Failed'}
      icon={
        isSettled ? <StageIconSuccess /> : <StageIconFail showLedger={false} />
      }
      description={failedText ?? 'Something went wrong'}
      footer={footer}
      footerHint={
        !isSettled &&
        failedText !== ErrorMessage.NOT_ENOUGH_ETHER &&
        onRetry &&
        (!isLoading ? (
          <ModalFooterButton onClick={handleRetry}>Retry</ModalFooterButton>
        ) : (
          <LoaderWrapper>
            <Loader size="small" />
          </LoaderWrapper>
        ))
      }
    />
  );
};
