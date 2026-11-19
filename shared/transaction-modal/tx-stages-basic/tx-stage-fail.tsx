import { useCallback, useRef, useState } from 'react';

import { Loader } from '@lidofinance/lido-ui';
import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconFail, StageIconSuccess } from './icons';
import { ModalFooterButton, LoaderWrapper } from './styles';
import type { TxRetryHandler } from '../types';

type TxStageFailProps = {
  failedText?: React.ReactNode;
  // Present only when the transaction may be submitted again: the stage
  // builders decide that from the error, see `isRetryableTxError`
  onRetry?: TxRetryHandler;
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
  const retryPending = useRef(false);
  const handleRetry = useCallback(async () => {
    if (retryPending.current) return;
    retryPending.current = true;
    setLoading(true);
    try {
      await onRetry?.();
    } catch (error) {
      console.error('[TxStageFail] Retry failed:', error);
    } finally {
      retryPending.current = false;
      setLoading(false);
    }
  }, [onRetry]);

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
