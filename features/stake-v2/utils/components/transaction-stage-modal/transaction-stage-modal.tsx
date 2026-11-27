import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type FC,
  type PropsWithChildren,
} from 'react';
import { Modal, Stack } from '@lidofinance/lido-app-ui';
import invariant from 'tiny-invariant';

import { createPromptSlot } from './prompt-slot';
import {
  initialTransactionModalState,
  transactionModalReducer,
} from './reducer';
import type {
  AsyncModalArgs,
  TransactionModalAction,
  TransactionStageModalContextValue,
} from './types';

const TransactionStageModalContext =
  createContext<TransactionStageModalContextValue | null>(null);
TransactionStageModalContext.displayName = 'TransactionStageModalContext';

export const useTransactionStageModal = () => {
  const value = useContext(TransactionStageModalContext);
  invariant(
    value,
    'useTransactionStageModal was used outside a TransactionStageModalProvider',
  );
  return value;
};

/**
 * The tx stages modal of one form. Mount it inside each form, not app-wide:
 * the modal lives and dies with its form, so there are no modal sessions to
 * track, no stages from another form's flow, nothing left over after
 * navigation. Stages are plain data (`dispatchTransactionModal`); a question
 * to the user is a promise (`dispatchAsyncModal`).
 */
export const TransactionStageModalProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [{ open, view }, dispatch] = useReducer(
    transactionModalReducer,
    initialTransactionModalState,
  );
  const [promptSlot] = useState(createPromptSlot);

  // a question left open with its form still gets an answer: null
  useEffect(() => () => promptSlot.dismiss(), [promptSlot]);

  const dispatchTransactionModal = useCallback(
    (action: TransactionModalAction) => {
      promptSlot.dismiss();
      dispatch(action);
    },
    [promptSlot],
  );

  const dispatchAsyncModal = useCallback(
    <TResult,>({ extraButton, ...content }: AsyncModalArgs<TResult>) => {
      const { promise, settle } = promptSlot.open<TResult>();
      dispatch({ type: 'prompt', ...content, extra: extraButton(settle) });
      return promise;
    },
    [promptSlot],
  );

  const type = view?.type ?? null;
  const value = useMemo(
    () => ({
      isOpen: open,
      type,
      dispatchTransactionModal,
      dispatchAsyncModal,
    }),
    [open, type, dispatchTransactionModal, dispatchAsyncModal],
  );

  return (
    <TransactionStageModalContext.Provider value={value}>
      {children}
      {view && (
        <Modal
          dismissible
          withOverlay
          open={open}
          title={view.title}
          subtitle={view.subTitle}
          onClose={() => dispatchTransactionModal({ type: 'close' })}
          data-stage={view.type}
        >
          <Stack gap={16}>
            {view.description}
            {view.bottomCTA}
            {view.extra}
          </Stack>
        </Modal>
      )}
    </TransactionStageModalContext.Provider>
  );
};
