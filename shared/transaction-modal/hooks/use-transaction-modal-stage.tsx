import { useCallback } from 'react';
import { useTransactionModal, TransactionModal } from '../transaction-modal';

export type TransactionModalTransitStage = (
  TxStageEl: React.ReactNode,
  modalProps?: Omit<React.ComponentProps<typeof TransactionModal>, 'children'>,
) => void;

// eslint-disable-next-line @typescript-eslint/ban-types
export const useTransactionModalStage = <S extends Record<string, Function>>(
  getStages: (transitStage: TransactionModalTransitStage) => S,
) => {
  const { openModal } = useTransactionModal();

  const createTxModalSession = useCallback(() => {
    const modal = openModal({});

    const transitStage: TransactionModalTransitStage = (
      TxStageEl,
      modalProps = {},
    ) => {
      modal.updateProps({
        children: TxStageEl,
        ...modalProps,
      });
    };

    return getStages(transitStage);
  }, [getStages, openModal]);

  return {
    createTxModalSession,
  };
};
