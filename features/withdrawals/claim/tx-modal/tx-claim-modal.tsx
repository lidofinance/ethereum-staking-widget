import { useMemo } from 'react';
import { formatBalance } from 'utils';

import {
  TxStageModal,
  TxStagePending,
  TxStageSuccess,
  TxStageSuccessMultisig,
  TxStageSign,
  TxStageFail,
} from 'features/withdrawals/shared/tx-stage-modal';
import { useTransactionModal, TX_STAGE } from 'shared/transaction-modal';
import {
  trackMatomoEvent,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config/trackMatomoEvent';

export const TxClaimModal = () => {
  const {
    isModalOpen,
    txStage,
    amount,
    txHash,
    errorText,
    onRetry,
    dispatchModalState,
  } = useTransactionModal();

  const amountAsString = useMemo(
    () => (amount ? formatBalance(amount, 4) : ''),
    [amount],
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
          <TxStageFail failedText={errorText} onClick={onRetry ?? undefined} />
        );
      default:
        return null;
    }
  }, [
    errorText,
    pendingTitle,
    signTitle,
    onRetry,
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
