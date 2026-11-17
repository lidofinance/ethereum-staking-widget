import { useCallback, useState } from 'react';

import { Loader } from '@lidofinance/lido-ui';
import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconFail, StageIconSuccess } from './icons';
import { ModalFooterButton, LoaderWrapper } from './styles';

type TxStageFailProps = {
  failedText?: React.ReactNode;
  // Present only when the transaction may be submitted again: the stage
  // builders decide that from the error, see `isRetryableTxError`
  // Returning false means the retry was not started: the failure stays as is
  onRetry?: (e: React.MouseEvent<HTMLSpanElement>) => void | boolean;
  // The transaction itself went through, only a follow-up read failed
  isSettled?: boolean;
  footer?: React.ReactNode;
};

export const TxStageFail = ({
  failedText,
  onRetry,
  isSettled = false,
  footer,
}: TxStageFailProps) => {
  const [isLoading, setLoading] = useState(false);
  const handleRetry = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      setLoading(true);
      if (onRetry?.(e) === false) setLoading(false);
    },
    [onRetry],
  );

  return (
    <TransactionModalContent
      title={isSettled ? 'Transaction completed' : 'Transaction Failed'}
      icon={
        isSettled ? <StageIconSuccess /> : <StageIconFail showLedger={false} />
      }
      description={failedText ?? 'Something went wrong'}
      footer={footer}
      footerHint={
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
