import {
  PropsWithChildren,
  useMemo,
  useState,
  useContext,
  useCallback,
  createContext,
} from 'react';
import invariant from 'tiny-invariant';

import { useLocalStorage } from '@lido-sdk/react';

import { dynamics } from 'config';
import { STORAGE_CLIENT_CONFIG } from 'config/storage';
import { EnvConfigParsed } from 'config/types';
import { CHAINS } from 'utils/chains';
import { parseEnvConfig } from 'utils/parse-env-config';

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

export const useClientConfig = () => {
  const context = useContext(ClientConfigContext);
  invariant(context, 'Attempt to use `client config` outside of provider');
  return context;
};

const DEFAULT_STATE: SavedClientConfig = {
  rpcUrls: {},
};

export const ClientConfigProvider = ({ children }: PropsWithChildren) => {
  const envConfig = parseEnvConfig(dynamics);

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
    return {
      ...envConfig,
      savedClientConfig,
      setSavedClientConfig: setSavedConfigAndRemember,
    };
  }, [envConfig, savedClientConfig, setSavedConfigAndRemember]);

  return (
    <ClientConfigContext.Provider value={contextValue}>
      {children}
    </ClientConfigContext.Provider>
  );
};
