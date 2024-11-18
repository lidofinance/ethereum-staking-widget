import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import invariant from 'tiny-invariant';

import type { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';

import { config } from 'config';
import { useRpcUrl } from 'config/rpc';
import { SETTINGS_PATH } from 'consts/urls';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import { useDappStatus } from 'modules/web3';
import { useCSPViolation } from 'features/ipfs/csp-violation-box/use-csp-violation';
import { useRouterPath } from 'shared/hooks/use-router-path';
import { useLidoQuery } from 'shared/hooks/use-lido-query';
import { useLocalStorage } from 'shared/hooks/use-local-storage';
import { useContractAddress } from 'shared/hooks/use-contract-address';
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

  const {
    data: stethAddress,
    // TODO:
    //  import { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';
    //  ERROR: LIDO_CONTRACT_NAMES is undefined
    //  ...
    //  import type { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';
    //  OK: LIDO_CONTRACT_NAMES is Type
  } = useContractAddress('lido' as LIDO_CONTRACT_NAMES);
  // console.log('IPFSInfoBoxStatusesProvider stethAddress:', stethAddress);

  const handleClickDismiss = useCallback(() => {
    setDismissStorage(true);
  }, [setDismissStorage]);

  const rpcUrl = useRpcUrl();
  const { data: isRPCAvailableRaw, isLoading } = useLidoQuery({
    queryKey: ['rpc-url-check', rpcUrl, chainId, stethAddress],
    strategy: STRATEGY_LAZY,
    enabled: !!config.ipfsMode,
    queryFn: async () => {
      return await checkRpcUrl(rpcUrl, chainId, stethAddress);
    },
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
