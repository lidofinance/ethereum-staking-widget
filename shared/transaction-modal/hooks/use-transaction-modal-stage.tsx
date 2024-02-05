import { useCallback } from 'react';
import { useTransactionModal, TransactionModal } from '../transaction-modal';
import { TX_STAGE } from '../types';

export const useTransactionModalStage = () => {
  const { openModal } = useTransactionModal();

  const openTxModalStage = useCallback(
    <P extends object>(
      txStage: TX_STAGE,
      TxStageComponent: React.ComponentType<P>,
      stageProps: P,
      modalProps: Omit<
        React.ComponentProps<typeof TransactionModal>,
        'children'
      > = {},
    ) => {
      const children = <TxStageComponent {...stageProps} />;
      openModal({ txStage, children, ...modalProps });
    },
    [openModal],
  );

  return {
    openTxModalStage,
  };
};
