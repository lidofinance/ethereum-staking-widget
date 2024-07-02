import { Modal } from '@lidofinance/lido-ui';
import { useConnectorInfo } from 'reef-knot/core-react';
import { getUseModal, ModalComponentType } from 'providers/modal-provider';

type TransactionModalProps = {
  isClosableOnLedger?: boolean;
  children?: React.ReactNode;
};

export const TransactionModal: ModalComponentType<TransactionModalProps> = ({
  open,
  isClosableOnLedger,
  onClose,
  children,
  ...props
}) => {
  const { isLedger } = useConnectorInfo();
  const isClosable = !isLedger || isClosableOnLedger;

  return (
    <Modal
      {...props}
      open={open && Boolean(children)}
      onClose={isClosable ? onClose : undefined}
    >
      {children}
    </Modal>
  );
};

export const useTransactionModal = getUseModal(TransactionModal);
