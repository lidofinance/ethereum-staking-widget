import { useCallback, useEffect } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useModalActions } from 'providers/modal-provider';
import { useTransactionModal, TransactionModal } from '../transaction-modal';

export type TransactionModalTransitStage = (
  TxStageEl: React.ReactNode,
  modalProps?: Omit<React.ComponentProps<typeof TransactionModal>, 'children'>,
) => void;

// eslint-disable-next-line @typescript-eslint/ban-types
export const useTransactionModalStage = <S extends Record<string, Function>>(
  getStages: (transitStage: TransactionModalTransitStage) => S,
) => {
  const { active } = useWeb3();
  const { openModal } = useTransactionModal();
  const { closeModal } = useModalActions();

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

  useEffect(() => {
    if (!active) {
      closeModal(TransactionModal);
    }
  }, [active, closeModal]);

  return {
    createTxModalSession,
  };
};
