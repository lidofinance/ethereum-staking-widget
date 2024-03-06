import { useEffect, useMemo, useRef } from 'react';
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
  const isMountedRef = useRef(true);

  const txModalStages = useMemo(() => {
    const transitStage: TransactionModalTransitStage = (
      TxStageEl,
      modalProps = {},
    ) => {
      if (!isMountedRef.current) return;
      openModal({
        children: TxStageEl,
        ...modalProps,
      });
    };

    return getStages(transitStage);
  }, [getStages, openModal]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!active) {
      closeModal(TransactionModal);
    }
  }, [active, closeModal]);

  return {
    txModalStages,
  };
};
