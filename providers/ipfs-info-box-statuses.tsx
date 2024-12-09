import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import invariant from 'tiny-invariant';

import { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';
import { useQuery } from '@tanstack/react-query';

import { config } from 'config';
import { useGetRpcUrlByChainId } from 'config/rpc';
import { SETTINGS_PATH } from 'consts/urls';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import { useDappStatus, useContractAddress } from 'modules/web3';
import { useCSPViolation } from 'features/ipfs/csp-violation-box/use-csp-violation';
import { useRouterPath } from 'shared/hooks/use-router-path';
import { useLocalStorage } from 'shared/hooks/use-local-storage';
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

  const { data: stethAddress } = useContractAddress(LIDO_CONTRACT_NAMES.lido);

  const handleClickDismiss = useCallback(() => {
    setDismissStorage(true);
  }, [setDismissStorage]);

  const rpcUrl = useGetRpcUrlByChainId()(chainId);
  const { data: isRPCAvailableRaw, isLoading } = useQuery({
    queryKey: ['rpc-url-check', rpcUrl, chainId, stethAddress],
    ...STRATEGY_LAZY,
    enabled: !!config.ipfsMode,
    queryFn: () => checkRpcUrl(rpcUrl, chainId, stethAddress),
  });
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
