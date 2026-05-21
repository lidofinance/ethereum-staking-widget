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
  shouldHideUpgradeNowButton: boolean;
  openDrawer: (options?: { hideUpgradeNowButton?: boolean }) => void;
  closeDrawer: () => void;
};

type OpenDrawerOptions = {
  hideUpgradeNowButton?: boolean;
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
  const [shouldHideUpgradeNowButton, setShouldHideUpgradeNowButton] =
    useState(false);

  const value = useMemo(
    () => ({
      isDrawerOpen,
      shouldHideUpgradeNowButton,
      openDrawer: (options?: OpenDrawerOptions) => {
        setShouldHideUpgradeNowButton(options?.hideUpgradeNowButton ?? false);
        setIsDrawerRight(true);
      },
      closeDrawer: () => {
        setIsDrawerRight(false);
      },
    }),
    [isDrawerOpen, shouldHideUpgradeNowButton],
  );

  return (
    <EthVaultDrawerContext.Provider value={value}>
      {children}
    </EthVaultDrawerContext.Provider>
  );
};
