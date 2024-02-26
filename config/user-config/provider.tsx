import {
  PropsWithChildren,
  useMemo,
  useState,
  useCallback,
  createContext,
} from 'react';

import { useLocalStorage } from '@lido-sdk/react';

import { CHAINS } from 'consts/chains';
import { STORAGE_USER_CONFIG } from 'consts/storage';

import { getUserConfigDefault } from './utils';
import { UserConfigDefaultType } from './types';

type SavedUserConfig = {
  rpcUrls: Partial<Record<CHAINS, string>>;
};

type UserConfigContext = UserConfigDefaultType & {
  savedUserConfig: SavedUserConfig;
  setSavedUserConfig: (config: SavedUserConfig) => void;
};

export const UserConfigContext = createContext<UserConfigContext | null>(null);

const DEFAULT_STATE: SavedUserConfig = {
  rpcUrls: {},
};

export const UserConfigProvider = ({ children }: PropsWithChildren) => {
  const [restoredSettings, setLocalStorage] = useLocalStorage(
    STORAGE_USER_CONFIG,
    DEFAULT_STATE,
  );

  const [savedUserConfig, setSavedUserConfig] =
    useState<SavedUserConfig>(restoredSettings);

  const setSavedConfigAndRemember = useCallback(
    (config: SavedUserConfig) => {
      setLocalStorage(config);
      setSavedUserConfig(config);
    },
    [setLocalStorage],
  );

  const contextValue = useMemo(() => {
    const userConfigDefault = getUserConfigDefault();

    return {
      ...userConfigDefault,
      savedUserConfig,
      setSavedUserConfig: setSavedConfigAndRemember,
    };
  }, [savedUserConfig, setSavedConfigAndRemember]);

  return (
    <UserConfigContext.Provider value={contextValue}>
      {children}
    </UserConfigContext.Provider>
  );
};
