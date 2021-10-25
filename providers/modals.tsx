import { createContext, useMemo, useCallback, memo, useState, FC } from 'react';
import { Modal, ModalConnect } from 'shared/wallet';

export type ModalContextValue = {
  openModal: (modal: MODAL) => void;
  closeModal: () => void;
};

export enum MODAL {
  connect,
  wallet,
}

export const ModalContext = createContext({} as ModalContextValue);

const ModalProvider: FC = ({ children }) => {
  const [active, setActive] = useState<MODAL | null>(null);

  const openModal = useCallback((modal: MODAL) => {
    setActive(modal);
  }, []);

  const closeModal = useCallback(() => {
    setActive(null);
  }, []);

  const value = useMemo(
    () => ({
      openModal,
      closeModal,
    }),
    [closeModal, openModal],
  );

  const common = {
    onClose: closeModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal open={active === MODAL.wallet} {...common} />
      <ModalConnect open={active === MODAL.connect} {...common} />
    </ModalContext.Provider>
  );
};

export default memo<FC>(ModalProvider);
