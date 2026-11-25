import { useEffect, useMemo, useRef, useState } from 'react';
import { useModalActions } from 'providers/modal-provider';
import { useDappStatus } from 'modules/web3';
import {
  useTransactionModal,
  TransactionModal,
  type TransactionModalProps,
} from '../transaction-modal';
import { createTxModalRun } from './tx-modal-run';

export type TransactionModalTransitStage = (
  TxStageEl: React.ReactNode,
  modalProps?: Omit<
    React.ComponentProps<typeof TransactionModal>,
    'children'
  > & {
    onOpen?: (close: () => void) => void;
  },
) => void;

/**
 * Builds the stages a flow shows in the transaction modal. Each run of the
 * flow gets stages bound to a run of its own (see `createTxModalRun`): the
 * run's first stage replaces the stages object with a fresh one, so the next
 * submit, which picks it up from the next render, is a separate run, and a
 * late stage of the earlier run cannot replace the newer run's modal.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const useTransactionModalStage = <S extends Record<string, Function>>(
  getStages: (transitStage: TransactionModalTransitStage) => S,
) => {
  const { isDappActive } = useDappStatus();
  const { openModal } = useTransactionModal();
  const { closeModal, getOpenSession } = useModalActions();
  const isMountedRef = useRef(true);
  // Close handle of the session this hook opened last, so the flow's modal
  // goes away together with the UI part that started the flow
  const closeSessionRef = useRef<(() => void) | null>(null);
  const [run, setRun] = useState(() =>
    createTxModalRun<TransactionModalProps>(),
  );

  const txModalStages = useMemo(() => {
    const slot = { openModal, getOpenSession };
    const transitStage: TransactionModalTransitStage = (
      TxStageEl,
      { onOpen, ...modalProps } = {},
    ) => {
      if (!isMountedRef.current) return;
      const isFirstStage = !run.isStarted;
      const session = run.show(slot, { children: TxStageEl, ...modalProps });
      if (!session) return;
      closeSessionRef.current = session.closeModal;
      if (isFirstStage) setRun(createTxModalRun<TransactionModalProps>());
      onOpen?.(session.closeModal);
    };

    return getStages(transitStage);
  }, [getStages, openModal, getOpenSession, run]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      closeSessionRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!isDappActive) {
      closeModal(TransactionModal);
    }
  }, [isDappActive, closeModal]);

  return {
    txModalStages,
  };
};
