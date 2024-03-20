import { useMemo, useState, useCallback } from 'react';

import { useLocalStorage } from '@lido-sdk/react';

import { CHAINS } from 'consts/chains';

import { getUserConfigDefault } from './utils';
import { UserConfigDefaultType } from './types';

const STORAGE_USER_CONFIG = 'lido-user-config';

type SavedUserConfig = {
  rpcUrls: Partial<Record<CHAINS, string>>;
};

export type UserConfigContextType = UserConfigDefaultType & {
  savedUserConfig: SavedUserConfig;
  setSavedUserConfig: (config: SavedUserConfig) => void;
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

  return useMemo(() => {
    const userConfigDefault = getUserConfigDefault();

    return {
      ...userConfigDefault,
      savedUserConfig,
      setSavedUserConfig: setSavedConfigAndRemember,
      isWalletConnectionAllowed,
      setIsWalletConnectionAllowed,
    };
  }, [isWalletConnectionAllowed, savedUserConfig, setSavedConfigAndRemember]);
};
