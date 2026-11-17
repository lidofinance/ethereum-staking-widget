import {
  memo,
  useMemo,
  useCallback,
  useContext,
  createContext,
  useRef,
  useState,
} from 'react';
import type { ModalProps as LidoModalProps } from '@lidofinance/lido-ui';
import { uniqueId } from 'lodash';

/**
 * Utility types
 */
type EmptyObj = Record<string, never>;

export type ModalProps<P extends object = EmptyObj> = LidoModalProps & P;

export type ModalComponentType<P extends object = EmptyObj> = React.FC<
  ModalProps<P>
>;

/**
 * Context definition
 */
export type ModalContextValue = {
  openModal: <P extends object>(
    modal: ModalComponentType<P>,
    props: P,
  ) => {
    modalSession: string;
    updateProps: (nextProps: P) => void;
    closeModal: () => void;
  };
  closeModal: <P extends object>(modal?: ModalComponentType<P>) => void;
  // The session of the modal on screen now, null when none is open
  getOpenSession: () => string | null;
};

export const modalContext = createContext({} as ModalContextValue);

/**
 * Context accessors
 */
export const useModalActions = () => {
  const { openModal, closeModal, getOpenSession } = useContext(modalContext);
  return { openModal, closeModal, getOpenSession };
};

export const useModal = <P extends object>(modal: ModalComponentType<P>) => {
  const { openModal, closeModal } = useContext(modalContext);

  return useMemo(
    () => ({
      openModal: (props: P) => openModal(modal, props),
      closeModal: () => closeModal(modal),
    }),
    [modal, openModal, closeModal],
  );
};

export const getUseModal = <P extends object>(modal: ModalComponentType<P>) => {
  return () => useModal(modal);
};

/**
 * Context provider
 */
type ModalProviderRaw = {
  children?: React.ReactNode;
};

const ModalProviderRaw = ({ children }: ModalProviderRaw) => {
  // The modal on screen: set as it opens, cleared as it closes, so callers
  // can tell synchronously whose modal is shown
  const openRef = useRef<{
    modalSession: string;
    modal: React.ComponentType<any>;
  } | null>(null);
  const [modalState, setModalState] = useState<{
    modal: React.ComponentType<any>;
    props: any;
  } | null>(null);

  const openModal: ModalContextValue['openModal'] = useCallback(
    (modal, props) => {
      const modalSession = uniqueId('modal-session-');
      openRef.current = { modalSession, modal };
      setModalState({ modal, props });

      /**
       * Sessin-based handlers
       */
      const updateProps = (nextProps: typeof props) => {
        if (openRef.current?.modalSession === modalSession) {
          setModalState(
            (prevState) =>
              prevState && { modal: prevState.modal, props: nextProps },
          );
        }
      };

      const closeModal = () => {
        setTimeout(() => {
          if (openRef.current?.modalSession !== modalSession) return;
          openRef.current = null;
          setModalState(null);
        }, 0);
      };

      return {
        modalSession,
        updateProps,
        closeModal,
      };
    },
    [],
  );

  const closeModal: ModalContextValue['closeModal'] = useCallback((modal) => {
    // Bind the close to the session that is current now: a modal opened before
    // the timer fires must not be closed by an action meant for its predecessor
    const open = openRef.current;
    // setTimeout helps to get rid of this error:
    // "Can't perform a react state update on an unmounted component"
    // after WalletConnect connection
    setTimeout(() => {
      if (!open || openRef.current !== open) return;
      if (modal && modal !== open.modal) return;
      openRef.current = null;
      setModalState(null);
    }, 0);
  }, []);

  const getOpenSession = useCallback(
    () => openRef.current?.modalSession ?? null,
    [],
  );

  const context = useMemo(
    () => ({
      openModal,
      closeModal,
      getOpenSession,
    }),
    [openModal, closeModal, getOpenSession],
  );

  const handleClose = useCallback(() => closeModal(), [closeModal]);

  return (
    <modalContext.Provider value={context}>
      {children}
      {modalState && (
        <modalState.modal open onClose={handleClose} {...modalState.props} />
      )}
    </modalContext.Provider>
  );
};

export const ModalProvider = memo(ModalProviderRaw);
