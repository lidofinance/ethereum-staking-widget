import {
  ReactNode,
  useMemo,
  useState,
  useContext,
  useCallback,
  createContext,
} from 'react';
import invariant from 'tiny-invariant';

import { useLocalStorage } from '@lido-sdk/react';
import { CHAINS } from '@lido-sdk/constants';

import { STORAGE_CUSTOM_CONFIG } from 'config/storage';
import { EnvConfigParsed } from 'config/types';

type SavedCustomConfig = {
  rpcUrls: Partial<Record<CHAINS, string>>;
};

type CustomConfigContext = EnvConfigParsed & {
  savedCustomConfig: SavedCustomConfig;
  setSavedCustomConfig: (config: SavedCustomConfig) => void;
};

export const customConfigContext = createContext<CustomConfigContext | null>(
  null,
);

export const useCustomConfig = () => {
  const context = useContext(customConfigContext);
  invariant(context, 'Attempt to use `custom config` outside of provider');
  return context;
};

type Props = {
  envConfig: EnvConfigParsed;
  children?: ReactNode;
};

const DEFAULT_STATE: SavedCustomConfig = {
  rpcUrls: {},
};

export const CustomConfigProvider = ({ children, envConfig }: Props) => {
  const [restoredSettings, setLocalStorage] = useLocalStorage(
    STORAGE_CUSTOM_CONFIG,
    DEFAULT_STATE,
  );

  const [savedCustomConfig, setSavedCustomConfig] =
    useState<SavedCustomConfig>(restoredSettings);

  const setSavedConfigAndRemember = useCallback(
    (config: SavedCustomConfig) => {
      setLocalStorage(config);
      setSavedCustomConfig(config);
    },
    [setLocalStorage],
  );

  const contextValue = useMemo(() => {
    return {
      ...envConfig,
      savedCustomConfig,
      setSavedCustomConfig: setSavedConfigAndRemember,
    };
  }, [envConfig, savedCustomConfig, setSavedConfigAndRemember]);

  return (
    <customConfigContext.Provider value={contextValue}>
      {children}
    </customConfigContext.Provider>
  );
};
