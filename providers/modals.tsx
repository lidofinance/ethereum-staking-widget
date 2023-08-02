import { createContext, useMemo, useCallback, memo, useState, FC } from 'react';
import { useThemeToggle } from '@lidofinance/lido-ui';
import { Modal } from 'shared/wallet';
import { WalletsModalForEth } from 'reef-knot/connect-wallet-modal';
import { walletsMetrics } from 'config/matomoWalletsEvents';

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
  const { themeName } = useThemeToggle();

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
    shouldInvertWalletIcon: themeName === 'dark',
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal open={active === MODAL.wallet} {...common} />
      <WalletsModalForEth
        open={active === MODAL.connect}
        {...common}
        metrics={walletsMetrics}
        hiddenWallets={['Opera Wallet']}
      />
    </ModalContext.Provider>
  );
};

export default memo<FC>(ModalProvider);
