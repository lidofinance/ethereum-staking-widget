import { Modal } from '@lidofinance/lido-ui';
import { useConnectorInfo } from 'reef-knot/web3-react';
import { getUseModal, ModalComponentType } from 'providers/modal-provider';

type TransactionModalProps = {
  isClosableOnLedger?: boolean;
  children?: React.ReactNode;
};

export const TransactionModal: ModalComponentType<TransactionModalProps> = ({
  isClosableOnLedger,
  onClose,
  children,
  ...props
}) => {
  const { isLedger } = useConnectorInfo();
  const isClosable = !isLedger || isClosableOnLedger;

  return (
    <Modal {...props} onClose={isClosable ? onClose : undefined}>
      {children}
    </Modal>
  );
};

export const useTransactionModal = getUseModal(TransactionModal);
