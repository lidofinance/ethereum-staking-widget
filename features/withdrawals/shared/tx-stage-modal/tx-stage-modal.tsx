import { FC, useMemo } from 'react';
import { Modal, ModalProps } from '@lidofinance/lido-ui';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { TX_STAGE } from './types';

interface TxStageModalProps extends ModalProps {
  txStage?: TX_STAGE;
}

export const TxStageModal: FC<TxStageModalProps> = (props) => {
  const { onClose, txStage, children } = props;

  const { isLedger } = useConnectorInfo();

  const isCloseButtonHidden = useMemo(
    () =>
      isLedger &&
      txStage &&
      ![TX_STAGE.SUCCESS, TX_STAGE.FAIL].includes(txStage),
    [isLedger, txStage],
  );

  return (
    <Modal {...props} onClose={isCloseButtonHidden ? undefined : onClose}>
      {children}
    </Modal>
  );
};
