import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useUserConfig } from 'config/user-config';

export const useIsSupportedChain = () => {
  const { chainId: walletChainId } = useAccount();
  const { supportedChainIds } = useUserConfig();

  return useMemo(() => {
    if (!walletChainId) return false;

    return supportedChainIds.indexOf(walletChainId) > -1;
  }, [walletChainId, supportedChainIds]);
};
