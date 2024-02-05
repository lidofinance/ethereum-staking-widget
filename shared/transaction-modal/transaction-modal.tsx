import { Modal } from '@lidofinance/lido-ui';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { TX_STAGE } from 'shared/transaction-modal';
import { getUseModal, ModalComponentType } from 'providers/modal-provider';

type TransactionModalProps = {
  txStage?: TX_STAGE;
  children?: React.ReactNode;
};

export const TransactionModal: ModalComponentType<TransactionModalProps> = (
  props,
) => {
  const { onClose, txStage, children } = props;

  const { isLedger } = useConnectorInfo();

  const isCloseButtonHidden =
    isLedger &&
    txStage !== TX_STAGE.SUCCESS &&
    txStage !== TX_STAGE.SUCCESS_MULTISIG &&
    txStage !== TX_STAGE.FAIL;

  return (
    <Modal {...props} onClose={isCloseButtonHidden ? undefined : onClose}>
      {children}
    </Modal>
  );
};

export const useTransactionModal = getUseModal(TransactionModal);
