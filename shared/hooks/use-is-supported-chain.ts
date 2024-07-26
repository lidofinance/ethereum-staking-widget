import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useUserConfig } from 'config/user-config';

export const useIsSupportedChain = () => {
  const { chainId } = useAccount();
  const { supportedChainIds } = useUserConfig();

  return useMemo(() => {
    if (!chainId) return false;

    return supportedChainIds.indexOf(chainId) > -1;
  }, [chainId, supportedChainIds]);
};
