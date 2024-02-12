import { v4 as uuid } from 'uuid';
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
};

export const modalContext = createContext({} as ModalContextValue);

/**
 * Context accessors
 */
export const useModalActions = () => {
  const { openModal, closeModal } = useContext(modalContext);
  return { openModal, closeModal };
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
  const modalSessionRef = useRef('');
  const [modalState, setModalState] = useState<{
    modal: React.ComponentType<any>;
    props: any;
  } | null>(null);

  const openModal: ModalContextValue['openModal'] = useCallback(
    (modal, props) => {
      const modalSession = uuid();
      modalSessionRef.current = modalSession;
      setModalState({ modal, props });

      /**
       * Sessin-based handlers
       */
      const updateProps = (nextProps: typeof props) => {
        if (modalSessionRef.current === modalSession) {
          setModalState(
            (prevState) =>
              prevState && { modal: prevState.modal, props: nextProps },
          );
        }
      };

      const closeModal = () => {
        setTimeout(() => {
          if (modalSessionRef.current === modalSession) setModalState(null);
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
    // setTimeout helps to get rid of this error:
    // "Can't perform a react state update on an unmounted component"
    // after WalletConnect connection
    setTimeout(() => {
      setModalState((prevState) => {
        if (modal && modal !== prevState?.modal) return prevState;
        return null;
      });
    }, 0);
  }, []);

  const context = useMemo(
    () => ({
      openModal,
      closeModal,
    }),
    [openModal, closeModal],
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
