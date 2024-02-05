import { useMemo } from 'react';

import { TransactionModalWrap } from 'shared/transaction-modal/transaction-modal-wrap';
import {
  TxStagePending,
  TxStageSuccess,
  TxStageSuccessMultisig,
  TxStageSign,
  TxStageFail,
} from 'shared/transaction-modal/stages';
import { useTransactionModal, TX_STAGE } from 'shared/transaction-modal';
import {
  trackMatomoEvent,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config/trackMatomoEvent';
import { FormatToken } from 'shared/formatters';

export const TransactionModalClaim = () => {
  const {
    isModalOpen,
    txStage,
    amount,
    txHash,
    errorText,
    onRetry,
    dispatchModalState,
  } = useTransactionModal();

  const content = useMemo(() => {
    const amountEl = amount && (
      <FormatToken
        amount={amount}
        symbol={'ETH'}
        adaptiveDecimals
        trimEllipsis
      />
    );

    switch (txStage) {
      case TX_STAGE.SIGN:
        return (
          <TxStageSign
            description={'Processing your request'}
            title={<>You are now claiming {amountEl}</>}
          />
        );
      case TX_STAGE.BLOCK:
        return (
          <TxStagePending
            title={<>You are now claiming {amountEl}</>}
            txHash={txHash}
          />
        );
      case TX_STAGE.SUCCESS:
        return (
          <TxStageSuccess
            description={'Claiming operation was successful'}
            title={<>{amountEl} has been claimed</>}
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
            onClickRetry={onRetry ?? undefined}
          />
        );
      default:
        return null;
    }
  }, [amount, txStage, txHash, errorText, onRetry]);

  return (
    <TransactionModalWrap
      open={isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={txStage}
    >
      {content}
    </TransactionModalWrap>
  );
};
