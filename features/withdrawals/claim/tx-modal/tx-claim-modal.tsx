import { useMemo } from 'react';
import { formatBalance } from 'utils';

import {
  TxStageModal,
  TxStagePending,
  TxStageSuccess,
  TxStageSuccessMultisig,
  TxStageSign,
  TxStageFail,
  TX_STAGE,
} from 'features/withdrawals/shared/tx-stage-modal';
import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';
import {
  trackMatomoEvent,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config/trackMatomoEvent';

export const TxClaimModal = () => {
  const {
    isModalOpen,
    txStage,
    requestAmount,
    txHash,
    errorText,
    startTx,
    dispatchModalState,
  } = useTransactionModal();

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
            onClickEtherscan={() =>
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.claimViewOnEtherscanSuccessTemplate,
              )
            }
          />
        );
      case TX_STAGE.SUCCESS_MULTISIG:
        return <TxStageSuccessMultisig />;
      case TX_STAGE.FAIL:
        return (
          <TxStageFail
            failedText={errorText}
            onClick={() => {
              startTx && startTx();
            }}
          />
        );
      default:
        return null;
    }
  }, [
    errorText,
    pendingTitle,
    signTitle,
    startTx,
    successTitle,
    txHash,
    txStage,
  ]);

  return (
    <TxStageModal
      open={isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={txStage}
    >
      {content}
    </TxStageModal>
  );
};
