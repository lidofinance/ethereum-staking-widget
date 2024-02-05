import { FC } from 'react';
import { Modal, ModalProps } from '@lidofinance/lido-ui';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { TX_STAGE } from 'shared/transaction-modal';

interface TransactionModalWrapProps extends ModalProps {
  txStage?: TX_STAGE;
}

export const TransactionModalWrap: FC<TransactionModalWrapProps> = (props) => {
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
