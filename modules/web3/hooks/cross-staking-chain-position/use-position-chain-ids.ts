import { useMemo } from 'react';
import { useChains } from 'wagmi';

import { useDappChain } from '../../web3-provider/dapp-chain';

/**
 * Chains of the nearest Support*Chains provider, in its order, that wagmi
 * has a client for. Stable while the set does not change, so a chain
 * switch does not rebuild what depends on it.
 */
export const usePositionChainIds = () => {
  const { supportedChainIds } = useDappChain();
  const chains = useChains();

  const key = supportedChainIds
    .filter((chainId) => chains.some(({ id }) => id === chainId))
    .join(',');

  return useMemo(() => (key ? key.split(',').map(Number) : []), [key]);
};
