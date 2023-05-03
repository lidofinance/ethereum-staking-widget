import { useMemo } from 'react';

import { formatBalance } from 'utils';
import {
  TxStageModal,
  TxStagePending,
  TxStageSign,
  TxStagePermit,
  TxStageFail,
  TxStageBunker,
  TX_STAGE,
} from 'features/withdrawals/shared/tx-stage-modal';
import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { TxRequestStageSuccess } from './tx-request-stage-success';

export const TxRequestModal = () => {
  const {
    dispatchModalState,
    startTx,
    requestAmount,
    token,
    txHash,
    errorText,
    isModalOpen,
    txStage,
  } = useTransactionModal();

  const content = useMemo(() => {
    const tokenName = token ? getTokenDisplayName(token) : '';
    const amountAsString = requestAmount ? formatBalance(requestAmount, 4) : '';

    const pendingDescription = 'Awaiting block confirmation';
    const pendingTitle = `You are requesting withdrawal for ${amountAsString} ${tokenName}`;

    const signDescription = `Requesting withdrawal for ${amountAsString} ${tokenName}`;
    const signTitle = `You are requesting withdrawal for ${amountAsString} ${tokenName}`;

    switch (txStage) {
      case TX_STAGE.PERMIT:
        return <TxStagePermit />;
      case TX_STAGE.SIGN:
        return <TxStageSign description={signDescription} title={signTitle} />;
      case TX_STAGE.BLOCK:
        return (
          <TxStagePending
            txHash={txHash}
            description={pendingDescription}
            title={pendingTitle}
          />
        );
      case TX_STAGE.SUCCESS:
        return (
          <TxRequestStageSuccess
            txHash={txHash}
            tokenName={tokenName}
            amountAsString={amountAsString}
          />
        );
      case TX_STAGE.FAIL:
        return (
          <TxStageFail
            failedText={errorText}
            onClick={() => {
              dispatchModalState({ type: 'reset' });
              startTx && startTx();
            }}
          />
        );
      case TX_STAGE.BUNKER:
        return (
          <TxStageBunker
            onClick={startTx ?? undefined}
            onClose={() => dispatchModalState({ type: 'close_modal' })}
          />
        );
      default:
        return null;
    }
  }, [
    dispatchModalState,
    errorText,
    requestAmount,
    startTx,
    token,
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
