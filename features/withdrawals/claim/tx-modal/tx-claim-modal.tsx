import { useCallback, useMemo } from 'react';
import { formatBalance } from 'utils';

import {
  TxStageModal,
  TxStagePending,
  TxStageSuccess,
  TxStageSign,
  TxStageFail,
  TX_STAGE,
} from 'features/withdrawals/shared/tx-stage-modal';
import { useClaimTxModal } from 'features/withdrawals/hooks';

export const TxRequestModal = () => {
  const {
    txStage,
    txHash,
    txModalFailedText,
    txModalOpen,
    closeTxModal,
    requestAmount,
    buttonRef,
  } = useClaimTxModal();

  const onRetry = useCallback(() => {
    buttonRef?.current?.click();
  }, [buttonRef]);

  const amountAsString = useMemo(
    () => (requestAmount ? formatBalance(requestAmount, 4) : ''),
    [requestAmount],
  );

  const successDescription = 'Claiming operation was successful';
  const successTitle = `${amountAsString} ETH has been claimed`;

  const pendingDescription = 'Awaiting block confirmation';
  const pendingTitle = `You are now claiming ${amountAsString} ETH`;

  const signDescription = 'Processing your request';
  const signTitle = `You are now claiming ${amountAsString} ETH`;

  const content = useMemo(() => {
    switch (txStage) {
      case TX_STAGE.SIGN:
        return <TxStageSign description={signDescription} title={signTitle} />;
      case TX_STAGE.BLOCK:
        return (
          <TxStagePending
            description={pendingDescription}
            title={pendingTitle}
            txHash={txHash}
          />
        );
      case TX_STAGE.SUCCESS:
        return (
          <TxStageSuccess
            description={successDescription}
            title={successTitle}
            txHash={txHash}
          />
        );
      case TX_STAGE.FAIL:
        return <TxStageFail failedText={txModalFailedText} onClick={onRetry} />;
      default:
        return null;
    }
  }, [
    onRetry,
    pendingTitle,
    signTitle,
    successTitle,
    txHash,
    txModalFailedText,
    txStage,
  ]);

  return (
    <TxStageModal open={txModalOpen} onClose={closeTxModal} txStage={txStage}>
      {content}
    </TxStageModal>
  );
};
