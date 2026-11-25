import {
  memo,
  useMemo,
  useCallback,
  useContext,
  createContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ModalProps as LidoModalProps } from '@lidofinance/lido-ui';
import { uniqueId } from 'lodash';

/**
 * Utility types
 */
type EmptyObj = Record<string, never>;
type ModalLifecycle = { onDismiss?: () => void };

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
    props: P & ModalLifecycle,
  ) => {
    modalSession: string;
    updateProps: (nextProps: P & ModalLifecycle) => void;
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
    onDismiss?: () => void;
  } | null>(null);
  const [modalState, setModalState] = useState<{
    modal: React.ComponentType<any>;
    props: any;
    closeModal: () => void;
  } | null>(null);

  const openModal: ModalContextValue['openModal'] = useCallback(
    (modal, props) => {
      const modalSession = uniqueId('modal-session-');
      const { onDismiss, ...componentProps } = props;
      const previous = openRef.current;
      openRef.current = { modalSession, modal, onDismiss };

      /**
       * Session-based handlers
       */
      const updateProps = (nextProps: typeof props) => {
        if (openRef.current?.modalSession === modalSession) {
          const previousDismiss = openRef.current.onDismiss;
          const { onDismiss, ...componentProps } = nextProps;
          openRef.current.onDismiss = onDismiss;
          setModalState(
            (prevState) => prevState && { ...prevState, props: componentProps },
          );
          if (previousDismiss !== onDismiss) previousDismiss?.();
        }
      };

      const closeModal = () => {
        setTimeout(() => {
          if (openRef.current?.modalSession !== modalSession) return;
          const dismissed = openRef.current;
          openRef.current = null;
          setModalState(null);
          dismissed.onDismiss?.();
        }, 0);
      };

      setModalState({ modal, props: componentProps, closeModal });
      previous?.onDismiss?.();

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
      open.onDismiss?.();
    }, 0);
  }, []);

  useEffect(
    () => () => {
      const dismissed = openRef.current;
      openRef.current = null;
      dismissed?.onDismiss?.();
    },
    [],
  );

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

  return (
    <modalContext.Provider value={context}>
      {children}
      {modalState && (
        <modalState.modal
          open
          onClose={modalState.closeModal}
          {...modalState.props}
        />
      )}
    </modalContext.Provider>
  );
};

export const ModalProvider = memo(ModalProviderRaw);
