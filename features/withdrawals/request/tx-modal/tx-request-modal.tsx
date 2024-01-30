import { useMemo } from 'react';

import { formatBalance } from 'utils';
import {
  TxStageModal,
  TxStagePending,
  TxStageSign,
  TxStagePermit,
  TxStageFail,
  TxStageBunker,
  TxStageSuccessMultisig,
} from 'features/withdrawals/shared/tx-stage-modal';
import {
  useTransactionModal,
  TX_STAGE,
  TX_OPERATION,
} from 'shared/transaction-modal';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { TxRequestStageSuccess } from './tx-request-stage-success';
import { withOptionaTooltip } from 'shared/components/tx-stage-modal/text-utils';

export const TxRequestModal = () => {
  const modalState = useTransactionModal();
  const content = useMemo(() => {
    const {
      dispatchModalState,
      onRetry,
      amount: requestAmount,
      token,
      txHash,
      errorText,
      dialog,
      txStage,
      txOperation,
    } = modalState;

    const tokenName = token ? getTokenDisplayName(token) : '';

    const amountDisplay = requestAmount
      ? formatBalance(requestAmount, 4, { adaptive: true, elipsis: true })
      : '';
    const amountFull = requestAmount ? formatBalance(requestAmount, 18) : '';
    const amountEl = withOptionaTooltip(
      amountDisplay,
      amountFull,
      <span data-testid="sendAmount">{amountDisplay}</span>,
    );

    // if more dialogs are added convert to switch on dialog type
    if (dialog)
      return (
        <TxStageBunker
          onClick={() => dialog.onOk}
          onClose={
            dialog.onClose
              ? () => {
                  dispatchModalState({ type: 'close_modal' });
                  dialog.onClose?.();
                }
              : undefined
          }
        />
      );

    const approvingTitle = (
      <>
        You are now approving {amountEl} {tokenName}
      </>
    );
    const approvingSingDescription = (
      <>
        Approving for {amountEl} {tokenName}
      </>
    );

    const withdrawalTitle = (
      <>
        You are requesting withdrawal for {amountEl} {tokenName}
      </>
    );
    const withdrawalSingDescription = (
      <>
        Requesting withdrawal for {amountEl} {tokenName}
      </>
    );

    const renderSign = () => {
      switch (txOperation) {
        case TX_OPERATION.APPROVE:
          return (
            <TxStageSign
              title={approvingTitle}
              description={approvingSingDescription}
            />
          );
        case TX_OPERATION.CONTRACT:
          return (
            <TxStageSign
              title={withdrawalTitle}
              description={withdrawalSingDescription}
            />
          );
        case TX_OPERATION.PERMIT:
          return <TxStagePermit />;
        default:
          return null;
      }
    };

    const renderBlock = () => {
      const pendingDescription = 'Awaiting block confirmation';
      switch (txOperation) {
        case TX_OPERATION.APPROVE:
          return (
            <TxStagePending
              txHash={txHash}
              title={approvingTitle}
              description={pendingDescription}
            />
          );
        case TX_OPERATION.CONTRACT:
          return (
            <TxStagePending
              txHash={txHash}
              title={withdrawalTitle}
              description={pendingDescription}
            />
          );
        default:
          return null;
      }
    };

    switch (txStage) {
      case TX_STAGE.SIGN:
        return renderSign();
      case TX_STAGE.BLOCK:
        return renderBlock();
      case TX_STAGE.SUCCESS:
        return (
          <TxRequestStageSuccess
            txHash={txHash}
            tokenName={tokenName}
            amount={amountEl}
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
  }, [modalState]);

  return (
    <TxStageModal
      open={modalState.isModalOpen}
      onClose={() => modalState.dispatchModalState({ type: 'close_modal' })}
      txStage={modalState.txStage}
    >
      {content}
    </TxStageModal>
  );
};
