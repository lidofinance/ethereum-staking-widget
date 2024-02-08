import {
  memo,
  useMemo,
  useCallback,
  useContext,
  createContext,
  useRef,
} from 'react';
import { useForceUpdate } from 'shared/hooks/useForceUpdate';
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
    modalSession: number;
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
  const forceUpdate = useForceUpdate();
  const modalSessionRef = useRef(0);

  const stateRef = useRef<{
    modal: React.ComponentType<any>;
    props: any;
  } | null>(null);

  const openModal: ModalContextValue['openModal'] = useCallback(
    (modal, props) => {
      const modalSession = Math.random();
      modalSessionRef.current = modalSession;
      stateRef.current = { modal, props };
      forceUpdate();

      /**
       * Sessin-based handlers
       */
      const updateProps = (nextProps: typeof props) => {
        if (stateRef.current && modalSessionRef.current === modalSession) {
          stateRef.current.props = nextProps;
          forceUpdate();
        }
      };
      const closeModal = () => {
        setTimeout(() => {
          if (stateRef.current && modalSessionRef.current === modalSession) {
            stateRef.current = null;
            forceUpdate();
          }
        }, 0);
      };

      return {
        modalSession,
        updateProps,
        closeModal,
      };
    },
    [forceUpdate],
  );

  const closeModal: ModalContextValue['closeModal'] = useCallback(
    (modal) => {
      // setTimeout helps to get rid of this error:
      // "Can't perform a react state update on an unmounted component"
      // after WalletConnect connection
      setTimeout(() => {
        if (modal && modal !== stateRef.current?.modal) return;
        stateRef.current = null;
        forceUpdate();
      }, 0);
    },
    [forceUpdate],
  );

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
      {stateRef.current && (
        <stateRef.current.modal
          open
          onClose={handleClose}
          {...stateRef.current.props}
        />
      )}
    </modalContext.Provider>
  );
};

export const ModalProvider = memo(ModalProviderRaw);
