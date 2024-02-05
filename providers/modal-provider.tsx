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
type ModalContextValue = {
  openModal: <P extends object>(modal: ModalComponentType<P>, props: P) => void;
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
  const { openModal: _openModal, closeModal: _closeModal } =
    useContext(modalContext);

  const openModal = useCallback(
    (props: P) => _openModal(modal, props),
    [_openModal, modal],
  );

  const closeModal = useCallback(
    () => _closeModal(modal),
    [_closeModal, modal],
  );

  return useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);
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
  const update = useForceUpdate();

  const stateRef = useRef<{
    modal: React.ComponentType<any>;
    props: any;
  } | null>(null);

  const openModal: ModalContextValue['openModal'] = useCallback(
    (modal, props) => {
      stateRef.current = { modal, props };
      update();
    },
    [update],
  );

  const closeModal: ModalContextValue['closeModal'] = useCallback(
    (modal) => {
      // setTimeout helps to get rid of this error:
      // "Can't perform a react state update on an unmounted component"
      // after WalletConnect connection
      setTimeout(() => {
        if (modal && modal !== stateRef.current?.modal) return;
        stateRef.current = null;
        update();
      }, 0);
    },
    [update],
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
