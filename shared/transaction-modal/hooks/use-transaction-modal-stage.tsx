import { useCallback } from 'react';
import { useTransactionModal, TransactionModal } from '../transaction-modal';

export const useTransactionModalStage = () => {
  const { openModal } = useTransactionModal();

  const openTxModalStage = useCallback(
    <P extends object>(
      TxStageComponent: React.ComponentType<P>,
      stageProps: P,
      modalProps: Omit<
        React.ComponentProps<typeof TransactionModal>,
        'children'
      > = {},
    ) => {
      const children = <TxStageComponent {...stageProps} />;
      openModal({ children, ...modalProps });
    },
    [openModal],
  );

  return {
    openTxModalStage,
  };
};
