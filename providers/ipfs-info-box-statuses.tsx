import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import invariant from 'tiny-invariant';
import { useLidoSWR, useLocalStorage } from '@lido-sdk/react';

import { config } from 'config';
import { useRpcUrl } from 'config/rpc';
import { SETTINGS_PATH } from 'consts/urls';
import { STRATEGY_LAZY } from 'consts/swr-strategies';

import { useDappStatus } from 'modules/web3';
import { useCSPViolation } from 'features/ipfs/csp-violation-box/use-csp-violation';
import { useRouterPath } from 'shared/hooks/use-router-path';
import { checkRpcUrl } from 'utils/check-rpc-url';

type IPFSInfoBoxStatusesContextValue = {
  isCSPViolated: boolean;
  isShownTheRPCNotAvailableBox: boolean;
  isRPCAvailable: boolean;
  handleClickDismiss: () => void;
};

const STORAGE_IPFS_INFO_DISMISS = 'lido-ipfs-info-dismiss';

const IPFSInfoBoxStatusContext =
  createContext<IPFSInfoBoxStatusesContextValue | null>(null);

export const useIPFSInfoBoxStatuses = () => {
  const value = useContext(IPFSInfoBoxStatusContext);
  invariant(value, 'useIPFSInfoBoxStatuses was called outside the provider');
  return value;
};

export const IPFSInfoBoxStatusesProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const { chainId } = useDappStatus();

  // CSP violation box
  const { isCSPViolated } = useCSPViolation();

  // RPC availability check result box
  const [isDismissed, setDismissStorage] = useLocalStorage(
    STORAGE_IPFS_INFO_DISMISS,
    false,
  );

  const handleClickDismiss = useCallback(() => {
    setDismissStorage(true);
  }, [setDismissStorage]);

  const rpcUrl = useRpcUrl();
  const { data: isRPCAvailableRaw, initialLoading: isLoading } = useLidoSWR(
    `rpc-url-check-${rpcUrl}-${chainId}`,
    async () => await checkRpcUrl(rpcUrl, chainId),
    { ...STRATEGY_LAZY, isPaused: () => !config.ipfsMode },
  );
  const isRPCAvailable = isRPCAvailableRaw === true;

  const pathname = useRouterPath();
  const isSettingsPage = pathname === SETTINGS_PATH;

  const isShownTheRPCNotAvailableBox =
    (!isDismissed || !isRPCAvailable) &&
    !isLoading &&
    !isSettingsPage &&
    !isCSPViolated;

  const contextValue = useMemo(
    () => ({
      isCSPViolated,
      isShownTheRPCNotAvailableBox,
      isRPCAvailable,
      handleClickDismiss,
    }),
    [
      handleClickDismiss,
      isCSPViolated,
      isRPCAvailable,
      isShownTheRPCNotAvailableBox,
    ],
  );

  return (
    <IPFSInfoBoxStatusContext.Provider value={contextValue}>
      {children}
    </IPFSInfoBoxStatusContext.Provider>
  );
};
