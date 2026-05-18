import {
  createContext,
  useContext,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
} from 'react';

type EthVaultDrawerContextValue = {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const EthVaultDrawerContext = createContext<EthVaultDrawerContextValue | null>(
  null,
);

export const useEthVaultDrawer = () => {
  const context = useContext(EthVaultDrawerContext);

  if (!context) {
    throw new Error(
      '[useEthVaultDrawer] EthVaultDrawerContext is used outside provider',
    );
  }

  return context;
};

export const EthVaultDrawerProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerRight] = useState(false);

  const value = useMemo(
    () => ({
      isDrawerOpen,
      openDrawer: () => setIsDrawerRight(true),
      closeDrawer: () => setIsDrawerRight(false),
    }),
    [isDrawerOpen],
  );

  return (
    <EthVaultDrawerContext.Provider value={value}>
      {children}
    </EthVaultDrawerContext.Provider>
  );
};
