import { useMemo, useState, useCallback, useRef } from 'react';

import { CHAINS } from 'consts/chains';
import { useLocalStorage } from 'shared/hooks/use-local-storage';

import { getUserConfigDefault } from './utils';
import { UserConfigDefaultType } from './types';
import { assignRpcUrl, type RpcUrls } from './rpc-urls';

const STORAGE_USER_CONFIG = 'lido-user-config';

type SavedUserConfig = {
  rpcUrls: RpcUrls;
};

export type UserConfigContextType = UserConfigDefaultType & {
  savedUserConfig: SavedUserConfig;
  setSavedUserConfig: (config: SavedUserConfig) => void;
  /** Sets or, with an empty url, clears one chain's custom RPC, keeping the others */
  setRpcUrl: (chainId: CHAINS, rpcUrl?: string) => void;
  isWalletConnectionAllowed: boolean;
  setIsWalletConnectionAllowed: (isAllowed: boolean) => void;
};

const DEFAULT_STATE: SavedUserConfig = {
  rpcUrls: {},
};

export const useUserConfigContext = () => {
  const [restoredSettings, setLocalStorage] = useLocalStorage(
    STORAGE_USER_CONFIG,
    DEFAULT_STATE,
  );

  const [isWalletConnectionAllowed, setIsWalletConnectionAllowed] =
    useState(true);

  const [savedUserConfig, setSavedUserConfig] =
    useState<SavedUserConfig>(restoredSettings);

  const setSavedConfigAndRemember = useCallback(
    (config: SavedUserConfig) => {
      setLocalStorage(config);
      setSavedUserConfig(config);
    },
    [setLocalStorage],
  );

  // Latest saved config for the chain-scoped setter, so two quick saves for
  // different chains never overwrite each other with a stale closure
  const savedUserConfigRef = useRef(savedUserConfig);
  savedUserConfigRef.current = savedUserConfig;

  const setRpcUrl = useCallback(
    (chainId: CHAINS, rpcUrl?: string) => {
      setSavedConfigAndRemember({
        rpcUrls: assignRpcUrl(
          savedUserConfigRef.current.rpcUrls,
          chainId,
          rpcUrl,
        ),
      });
    },
    [setSavedConfigAndRemember],
  );

  return useMemo(() => {
    const userConfigDefault = getUserConfigDefault();

    return {
      ...userConfigDefault,
      savedUserConfig,
      setSavedUserConfig: setSavedConfigAndRemember,
      setRpcUrl,
      isWalletConnectionAllowed,
      setIsWalletConnectionAllowed,
    };
  }, [
    isWalletConnectionAllowed,
    savedUserConfig,
    setSavedConfigAndRemember,
    setRpcUrl,
  ]);
};
