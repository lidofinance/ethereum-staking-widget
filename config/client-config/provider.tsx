import {
  PropsWithChildren,
  useMemo,
  useState,
  useCallback,
  createContext,
} from 'react';

import { useLocalStorage } from '@lido-sdk/react';

import { dynamics } from 'config';
import { STORAGE_CLIENT_CONFIG } from 'consts/storage';
import { CHAINS } from 'utils/chains';

import { parseEnvConfig } from './utils';
import { EnvConfigParsed } from './types';

// TODO whole file: '*Сlient*' --> '*User*', 'client' --> 'user'

type SavedClientConfig = {
  rpcUrls: Partial<Record<CHAINS, string>>;
};

type ClientConfigContext = EnvConfigParsed & {
  savedClientConfig: SavedClientConfig;
  setSavedClientConfig: (config: SavedClientConfig) => void;
};

export const ClientConfigContext = createContext<ClientConfigContext | null>(
  null,
);

const DEFAULT_STATE: SavedClientConfig = {
  rpcUrls: {},
};

// TODO: 'ClientConfigProvider' --> 'UserConfigProvider'
export const ClientConfigProvider = ({ children }: PropsWithChildren) => {
  const [restoredSettings, setLocalStorage] = useLocalStorage(
    STORAGE_CLIENT_CONFIG,
    DEFAULT_STATE,
  );

  const [savedClientConfig, setSavedClientConfig] =
    useState<SavedClientConfig>(restoredSettings);

  const setSavedConfigAndRemember = useCallback(
    (config: SavedClientConfig) => {
      setLocalStorage(config);
      setSavedClientConfig(config);
    },
    [setLocalStorage],
  );

  const contextValue = useMemo(() => {
    const envConfig = parseEnvConfig(dynamics);

    return {
      ...envConfig,
      savedClientConfig,
      setSavedClientConfig: setSavedConfigAndRemember,
    };
  }, [savedClientConfig, setSavedConfigAndRemember]);

  return (
    <ClientConfigContext.Provider value={contextValue}>
      {children}
    </ClientConfigContext.Provider>
  );
};
