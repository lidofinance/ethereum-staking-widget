import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useUserConfig } from 'config/user-config';

export const useIsConnectedWalletAndSupportedChain = () => {
  const { chainId, isConnected } = useAccount();
  const { supportedChainIds } = useUserConfig();

  return useMemo(() => {
    if (!chainId) return false;

    return isConnected && supportedChainIds.indexOf(chainId) > -1;
  }, [chainId, isConnected, supportedChainIds]);
};
